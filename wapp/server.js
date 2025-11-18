const express = require('express');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Load environment variables from .env file
require('dotenv').config();

const app = express();

// Configuration (you can use environment variables in production)
const PORT = process.env.PORT || 3005;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'my_secure_verify_token_123';
const MESSAGES_DIR = process.env.MESSAGES_DIR || './messages';

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || '2fa_auth',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

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
app.post('/webhook', async (req, res) => {
  const body = req.body;

  console.log('Incoming webhook:', JSON.stringify(body, null, 2));

  try {
    // Check if it's a WhatsApp Business message
    if (body.object === 'whatsapp_business_account') {
      if (body.entry && body.entry.length > 0) {
        for (const entry of body.entry) {
          if (entry.changes && entry.changes.length > 0) {
            for (const change of entry.changes) {
              if (change.value.messages && change.value.messages.length > 0) {
                for (const message of change.value.messages) {
                  await processMessage(message, change.value);
                }
              }
            }
          }
        }
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
app.post('/webhook/test', async (req, res) => {
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

    await saveMessage(messageData);

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
app.get('/messages', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        id,
        message_from as "messageFrom",
        message,
        datetime,
        message_type as "messageType",
        message_id as "messageId",
        category,
        created_at as "createdAt"
      FROM whatsapp_messages
      ORDER BY datetime DESC`
    );

    res.status(200).json({
      total: result.rows.length,
      messages: result.rows
    });
  } catch (error) {
    console.error('Error reading messages:', error);
    res.status(500).json({
      error: 'Failed to read messages',
      details: error.message
    });
  }
});

// Get notifications summary (categorized messages)
app.get('/notifications', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        id,
        message_from as "messageFrom",
        message,
        datetime,
        message_type as "messageType",
        message_id as "messageId",
        category,
        created_at as "createdAt"
      FROM whatsapp_messages
      ORDER BY datetime DESC`
    );

    const messages = result.rows;

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
      error: 'Failed to read notifications',
      details: error.message
    });
  }
});

// Process WhatsApp message
async function processMessage(message, value) {
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
  await saveMessage(messageData);
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

// Save message to database
async function saveMessage(messageData) {
  try {
    await pool.query(
      `INSERT INTO whatsapp_messages (
        message_from, message, datetime, message_type, message_id, category
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (message_id) DO NOTHING`,
      [
        messageData.messageFrom,
        messageData.message,
        messageData.datetime,
        messageData.messageType || 'text',
        messageData.messageId || null,
        messageData.category || 'UNCATEGORIZED'
      ]
    );
    console.log(`Message saved to database from: ${messageData.messageFrom}`);
  } catch (error) {
    console.error('Error saving message to database:', error);
    // Fallback to filesystem if database fails
    const timestamp = Date.now();
    const filename = `message_${timestamp}.json`;
    const filepath = path.join(MESSAGES_DIR, filename);
    fs.writeFileSync(filepath, JSON.stringify(messageData, null, 2), 'utf8');
    console.log(`Message saved to filesystem (fallback): ${filepath}`);
  }
}

// ============================================
// OPPORTUNITIES API ENDPOINTS
// ============================================

// Get all opportunities
app.get('/opportunities', async (req, res) => {
  try {
    const { type, status } = req.query;
    
    let query = 'SELECT * FROM opportunities WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (type) {
      query += ` AND opportunity_type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ' ORDER BY received_at DESC';

    const result = await pool.query(query, params);

    // Group by status for Kanban board
    const grouped = {
      pending_contact: [],
      waiting_response: [],
      evolved: [],
      take_action: [],
      frozen: [],
      appraisals: [],
      rental_agency: [],
      rental_outsourced: []
    };

    result.rows.forEach(opp => {
      if (grouped[opp.status]) {
        grouped[opp.status].push(opp);
      }
    });

    res.json({
      total: result.rows.length,
      opportunities: result.rows,
      grouped
    });
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    res.status(500).json({ error: 'Failed to fetch opportunities' });
  }
});

// Get a single opportunity
app.get('/opportunities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM opportunities WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching opportunity:', error);
    res.status(500).json({ error: 'Failed to fetch opportunity' });
  }
});

// Create a new opportunity
app.post('/opportunities', async (req, res) => {
  try {
    const {
      channel = 'public_website',
      property_id,
      email,
      phone,
      mobile,
      contact_name,
      messages = [],
      status = 'pending_contact',
      opportunity_type,
      metadata = {}
    } = req.body;

    // Validate required fields
    if (!opportunity_type || !['sale', 'rental'].includes(opportunity_type)) {
      return res.status(400).json({ 
        error: 'opportunity_type is required and must be either "sale" or "rental"' 
      });
    }

    // At least one contact method is required
    if (!email && !phone && !mobile) {
      return res.status(400).json({
        error: 'At least one contact method (email, phone, or mobile) is required'
      });
    }

    const result = await pool.query(
      `INSERT INTO opportunities (
        channel, property_id, email, phone, mobile, contact_name,
        messages, status, opportunity_type, metadata, received_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7::text[], $8, $9, $10, NOW())
      RETURNING *`,
      [
        channel,
        property_id || null,
        email || null,
        phone || null,
        mobile || null,
        contact_name || null,
        messages,
        status,
        opportunity_type,
        JSON.stringify(metadata)
      ]
    );

    console.log('Opportunity created:', result.rows[0]);

    res.status(201).json({
      success: true,
      opportunity: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating opportunity:', error);
    res.status(500).json({ error: 'Failed to create opportunity' });
  }
});

// Update opportunity status (for drag & drop)
app.put('/opportunities/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      'pending_contact',
      'waiting_response',
      'evolved',
      'take_action',
      'frozen',
      'appraisals',
      'rental_agency',
      'rental_outsourced'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    const result = await pool.query(
      'UPDATE opportunities SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    res.json({
      success: true,
      opportunity: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating opportunity status:', error);
    res.status(500).json({ error: 'Failed to update opportunity status' });
  }
});

// Update opportunity (full update)
app.put('/opportunities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      email,
      phone,
      mobile,
      contact_name,
      messages,
      status,
      property_id,
      metadata
    } = req.body;

    const result = await pool.query(
      `UPDATE opportunities 
       SET email = COALESCE($1, email),
           phone = COALESCE($2, phone),
           mobile = COALESCE($3, mobile),
           contact_name = COALESCE($4, contact_name),
           messages = COALESCE($5, messages),
           status = COALESCE($6, status),
           property_id = COALESCE($7, property_id),
           metadata = COALESCE($8, metadata),
           updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
      [
        email,
        phone,
        mobile,
        contact_name,
        messages,
        status,
        property_id,
        metadata ? JSON.stringify(metadata) : null,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    res.json({
      success: true,
      opportunity: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating opportunity:', error);
    res.status(500).json({ error: 'Failed to update opportunity' });
  }
});

// Add a message to an opportunity
app.post('/opportunities/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const result = await pool.query(
      `UPDATE opportunities 
       SET messages = array_append(messages, $1),
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [message, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    res.json({
      success: true,
      opportunity: result.rows[0]
    });
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ error: 'Failed to add message' });
  }
});

// Delete an opportunity
app.delete('/opportunities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM opportunities WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    res.json({
      success: true,
      message: 'Opportunity deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting opportunity:', error);
    res.status(500).json({ error: 'Failed to delete opportunity' });
  }
});

// Test endpoint to simulate opportunity from public website
app.post('/opportunities/test/from-website', async (req, res) => {
  try {
    const {
      property_id,
      email,
      phone,
      mobile,
      contact_name,
      opportunity_type = 'sale',
      initial_message
    } = req.body;

    const messages = initial_message ? [initial_message] : [];

    const result = await pool.query(
      `INSERT INTO opportunities (
        channel, property_id, email, phone, mobile, contact_name,
        messages, status, opportunity_type, received_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7::text[], $8, $9, NOW())
      RETURNING *`,
      [
        'public_website',
        property_id || null,
        email || null,
        phone || null,
        mobile || null,
        contact_name || null,
        messages,
        'pending_contact',
        opportunity_type
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Test opportunity created from website',
      opportunity: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating test opportunity:', error);
    res.status(500).json({ error: 'Failed to create test opportunity' });
  }
});

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

