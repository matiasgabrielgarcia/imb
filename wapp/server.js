const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

// Configuration (you can use environment variables in production)
const PORT = process.env.PORT || 3005;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'my_secure_verify_token_123';
const MESSAGES_DIR = process.env.MESSAGES_DIR || './messages';

// Middleware
app.use(express.json());

// CORS configuration for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Create messages directory if it doesn't exist
if (!fs.existsSync(MESSAGES_DIR)) {
  fs.mkdirSync(MESSAGES_DIR, { recursive: true });
}

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    message: 'WhatsApp Business Webhook Server',
    endpoints: {
      verification: 'GET /webhook',
      messages: 'POST /webhook'
    }
  });
});

// Webhook verification endpoint (GET)
// WhatsApp will call this to verify your webhook
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('Webhook verification request received');
  console.log('Mode:', mode);
  console.log('Token:', token);

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified successfully');
    res.status(200).send(challenge);
  } else {
    console.log('Webhook verification failed');
    res.status(403).send('Forbidden');
  }
});

// Webhook endpoint to receive messages (POST)
app.post('/webhook', (req, res) => {
  const body = req.body;

  console.log('Incoming webhook:', JSON.stringify(body, null, 2));

  try {
    // Check if it's a WhatsApp Business message
    if (body.object === 'whatsapp_business_account') {
      if (body.entry && body.entry.length > 0) {
        body.entry.forEach(entry => {
          if (entry.changes && entry.changes.length > 0) {
            entry.changes.forEach(change => {
              if (change.value.messages && change.value.messages.length > 0) {
                change.value.messages.forEach(message => {
                  processMessage(message, change.value);
                });
              }
            });
          }
        });
      }
      
      res.status(200).send('EVENT_RECEIVED');
    } else {
      res.status(404).send('Not Found');
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Test endpoint for manual testing with Postman
app.post('/webhook/test', (req, res) => {
  const { messageFrom, message } = req.body;

  if (!messageFrom || !message) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['messageFrom', 'message']
    });
  }

  try {
    const messageData = {
      messageFrom,
      message,
      datetime: new Date().toISOString(),
      category: categorizeMessage(message)
    };

    saveMessage(messageData);

    res.status(200).json({
      success: true,
      message: 'Message saved successfully',
      data: messageData
    });
  } catch (error) {
    console.error('Error saving test message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save message'
    });
  }
});

// Get all saved messages
app.get('/messages', (req, res) => {
  try {
    const files = fs.readdirSync(MESSAGES_DIR)
      .filter(file => file.endsWith('.json'))
      .sort()
      .reverse(); // Most recent first

    const messages = files.map(file => {
      const content = fs.readFileSync(path.join(MESSAGES_DIR, file), 'utf8');
      return JSON.parse(content);
    });

    res.status(200).json({
      total: messages.length,
      messages
    });
  } catch (error) {
    console.error('Error reading messages:', error);
    res.status(500).json({
      error: 'Failed to read messages'
    });
  }
});

// Get notifications summary (categorized messages)
app.get('/notifications', (req, res) => {
  try {
    const files = fs.readdirSync(MESSAGES_DIR)
      .filter(file => file.endsWith('.json'))
      .sort()
      .reverse(); // Most recent first

    const messages = files.map(file => {
      const content = fs.readFileSync(path.join(MESSAGES_DIR, file), 'utf8');
      return JSON.parse(content);
    });

    // Categorize and filter messages
    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const categorized = messages.map(msg => ({
      ...msg,
      isOld: new Date(msg.datetime) < oneMonthAgo
    }));

    // Group by category
    const summary = {
      BUYER: categorized.filter(m => m.category === 'BUYER'),
      SELLER: categorized.filter(m => m.category === 'SELLER'),
      TENANT: categorized.filter(m => m.category === 'TENANT'),
      LANDLORD: categorized.filter(m => m.category === 'LANDLORD'),
      UNCATEGORIZED: categorized.filter(m => !m.category || m.category === 'UNCATEGORIZED')
    };

    res.status(200).json({
      total: messages.length,
      summary: {
        BUYER: summary.BUYER.length,
        SELLER: summary.SELLER.length,
        TENANT: summary.TENANT.length,
        LANDLORD: summary.LANDLORD.length,
        UNCATEGORIZED: summary.UNCATEGORIZED.length
      },
      notifications: categorized
    });
  } catch (error) {
    console.error('Error reading notifications:', error);
    res.status(500).json({
      error: 'Failed to read notifications'
    });
  }
});

// Process WhatsApp message
function processMessage(message, value) {
  const messageText = extractMessageText(message);
  const messageData = {
    messageFrom: message.from,
    message: messageText,
    datetime: new Date(parseInt(message.timestamp) * 1000).toISOString(),
    messageType: message.type,
    messageId: message.id,
    category: categorizeMessage(messageText)
  };

  console.log('Processing message:', messageData);
  saveMessage(messageData);
}

// Extract text from different message types
function extractMessageText(message) {
  switch (message.type) {
    case 'text':
      return message.text.body;
    case 'image':
      return `[Image] Caption: ${message.image.caption || 'No caption'}`;
    case 'video':
      return `[Video] Caption: ${message.video.caption || 'No caption'}`;
    case 'audio':
      return '[Audio message]';
    case 'document':
      return `[Document] Filename: ${message.document.filename || 'Unknown'}`;
    case 'location':
      return `[Location] Lat: ${message.location.latitude}, Long: ${message.location.longitude}`;
    case 'contacts':
      return '[Contact card]';
    default:
      return `[${message.type} message]`;
  }
}

// Categorize message based on content
function categorizeMessage(messageText) {
  if (!messageText || typeof messageText !== 'string') {
    return 'UNCATEGORIZED';
  }

  const text = messageText.toLowerCase();

  // Keywords for each category
  const buyerKeywords = ['comprar', 'compro', 'busco casa', 'busco propiedad', 'quiero comprar', 
                         'interesado en comprar', 'buyer', 'looking to buy', 'want to buy'];
  const sellerKeywords = ['vender', 'vendo', 'quiero vender', 'poner en venta', 
                          'selling', 'sell', 'want to sell', 'for sale'];
  const tenantKeywords = ['alquilar', 'alquilo', 'busco alquiler', 'busco en alquiler', 
                          'quiero alquilar', 'renting', 'rent', 'looking to rent', 'need to rent'];
  const landlordKeywords = ['alquilar propiedad', 'alquilar mi casa', 'tengo para alquilar',
                            'poner en alquiler', 'arrendar', 'renting out', 'have property to rent'];

  // Check for buyer
  if (buyerKeywords.some(keyword => text.includes(keyword))) {
    return 'BUYER';
  }

  // Check for seller
  if (sellerKeywords.some(keyword => text.includes(keyword))) {
    return 'SELLER';
  }

  // Check for landlord (owner wanting to rent out)
  if (landlordKeywords.some(keyword => text.includes(keyword))) {
    return 'LANDLORD';
  }

  // Check for tenant (person wanting to rent)
  if (tenantKeywords.some(keyword => text.includes(keyword))) {
    return 'TENANT';
  }

  return 'UNCATEGORIZED';
}

// Save message to filesystem
function saveMessage(messageData) {
  const timestamp = Date.now();
  const filename = `message_${timestamp}.json`;
  const filepath = path.join(MESSAGES_DIR, filename);

  fs.writeFileSync(filepath, JSON.stringify(messageData, null, 2), 'utf8');
  console.log(`Message saved to: ${filepath}`);
}

// Start server
app.listen(PORT, () => {
  console.log('================================================');
  console.log('WhatsApp Business Webhook Server');
  console.log('================================================');
  console.log(`Server running on port ${PORT}`);
  console.log(`Webhook URL: http://localhost:${PORT}/webhook`);
  console.log(`Test endpoint: http://localhost:${PORT}/webhook/test`);
  console.log(`Messages directory: ${path.resolve(MESSAGES_DIR)}`);
  console.log(`Verify token: ${VERIFY_TOKEN}`);
  console.log('================================================');
});

