// Load environment variables from .env file FIRST, before any other requires
require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');
const { query } = require('./db-connection');
const { authenticateToken, buildUserFilter, canSeeAllMessages } = require('./auth-middleware');

const app = express();

// Configuration (you can use environment variables in production)
const PORT = process.env.PORT || 3005;
const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || process.env.VERIFY_TOKEN || 'my_secure_verify_token_123';
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
      messages: 'POST /webhook',
      diagnostics: 'GET /diagnostics'
    }
  });
});

// Diagnostics endpoint to check configuration
app.get('/diagnostics', (req, res) => {
  const hasVerifyToken = !!VERIFY_TOKEN;
  const tokenLength = VERIFY_TOKEN ? VERIFY_TOKEN.length : 0;
  const tokenPreview = VERIFY_TOKEN ? `${VERIFY_TOKEN.substring(0, 10)}...${VERIFY_TOKEN.substring(VERIFY_TOKEN.length - 10)}` : 'NOT SET';
  
  res.json({
    status: 'ok',
    configuration: {
      port: PORT,
      verifyTokenSet: hasVerifyToken,
      verifyTokenLength: tokenLength,
      verifyTokenPreview: tokenPreview,
      environment: process.env.NODE_ENV || 'development'
    },
    environmentVariables: {
      WEBHOOK_VERIFY_TOKEN: process.env.WEBHOOK_VERIFY_TOKEN ? 'SET' : 'NOT SET',
      VERIFY_TOKEN: process.env.VERIFY_TOKEN ? 'SET' : 'NOT SET',
      PORT: process.env.PORT || 'NOT SET (using default: 3005)'
    },
    testUrl: `${req.protocol}://${req.get('host')}/webhook?hub.mode=subscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=test123`
  });
});

// Webhook verification endpoint (GET)
// WhatsApp will call this to verify your webhook
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('================================================');
  console.log('Webhook verification request received');
  console.log('Mode:', mode);
  console.log('Received Token:', token);
  console.log('Expected Token:', VERIFY_TOKEN);
  console.log('Token Match:', token === VERIFY_TOKEN);
  console.log('Mode Match:', mode === 'subscribe');
  console.log('Challenge:', challenge);
  console.log('================================================');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verified successfully');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Webhook verification failed');
    console.log('Reason:', {
      modeMatch: mode === 'subscribe',
      tokenMatch: token === VERIFY_TOKEN,
      modeReceived: mode,
      tokenReceived: token ? `${token.substring(0, 10)}...` : 'undefined',
      tokenExpected: VERIFY_TOKEN ? `${VERIFY_TOKEN.substring(0, 10)}...` : 'undefined'
    });
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

// Get all saved messages (user-filtered)
app.get('/messages', authenticateToken, async (req, res) => {
  try {
    const userFilter = buildUserFilter(req.user);
    const result = await query(
      `SELECT 
        id,
        message_from as "messageFrom",
        message,
        datetime,
        message_type as "messageType",
        message_id as "messageId",
        category,
        user_id as "userId",
        sent_by_user_id as "sentByUserId",
        created_at as "createdAt"
      FROM whatsapp_messages
      WHERE ${userFilter.condition}
      ORDER BY datetime DESC`,
      userFilter.params
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

// Get notifications summary (categorized messages, user-filtered)
app.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const userFilter = buildUserFilter(req.user);
    const result = await query(
      `SELECT 
        id,
        message_from as "messageFrom",
        message,
        datetime,
        message_type as "messageType",
        message_id as "messageId",
        category,
        user_id as "userId",
        sent_by_user_id as "sentByUserId",
        created_at as "createdAt"
      FROM whatsapp_messages
      WHERE ${userFilter.condition}
      ORDER BY datetime DESC`,
      userFilter.params
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
    await query(
      `INSERT INTO whatsapp_messages (
        message_from, message, datetime, message_type, message_id, category, user_id, sent_by_user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (message_id) DO NOTHING`,
      [
        messageData.messageFrom,
        messageData.message,
        messageData.datetime,
        messageData.messageType || 'text',
        messageData.messageId || null,
        messageData.category || 'UNCATEGORIZED',
        messageData.userId || null,
        messageData.sentByUserId || null
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
app.get('/opportunities', authenticateToken, async (req, res) => {
  try {
    const { type, status, months } = req.query;
    const userFilter = buildUserFilter(req.user);

    let sqlQuery = 'SELECT * FROM opportunities WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    // Add user filtering (unless admin/backoffice)
    if (!canSeeAllMessages(req.user)) {
      sqlQuery += ` AND (user_id = $${paramIndex} OR user_id IS NULL)`;
      params.push(req.user.id);
      paramIndex++;
    }

    if (type) {
      sqlQuery += ` AND opportunity_type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (status) {
      sqlQuery += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    // Date filter: months parameter (1, 2, or 3)
    if (months) {
      const monthsNum = parseInt(months);
      if ([1, 2, 3].includes(monthsNum)) {
        // Safe: monthsNum is validated to be 1, 2, or 3 only
        sqlQuery += ` AND received_at >= NOW() - INTERVAL '${monthsNum} months'`;
      }
    }

    sqlQuery += ' ORDER BY received_at DESC';

    const result = await query(sqlQuery, params);

    // Auto-freeze check: Check all opportunities for auto-freeze
    for (const opp of result.rows) {
      await checkAndAutoFreeze(opp.id, opp.status);
    }

    // Re-fetch after potential status changes
    const finalResult = await query(sqlQuery, params);

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

    finalResult.rows.forEach(opp => {
      if (grouped[opp.status]) {
        grouped[opp.status].push(opp);
      }
    });

    res.json({
      total: finalResult.rows.length,
      opportunities: finalResult.rows,
      grouped
    });
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    res.status(500).json({ error: 'Failed to fetch opportunities' });
  }
});

// Get a single opportunity (user-filtered)
app.get('/opportunities/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    let sqlQuery = 'SELECT * FROM opportunities WHERE id = $1';
    const params = [id];
    
    // Add user filtering (unless admin/backoffice)
    if (!canSeeAllMessages(req.user)) {
      sqlQuery += ' AND (user_id = $2 OR user_id IS NULL)';
      params.push(req.user.id);
    }
    
    const result = await query(sqlQuery, params);

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

    const result = await query(
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

    // Check if status is actually changing to update status_updated_at
    const currentOpp = await query(
      'SELECT status FROM opportunities WHERE id = $1',
      [id]
    );

    if (currentOpp.rows.length === 0) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    const currentStatus = currentOpp.rows[0].status;
    let updateQuery;
    let params;

    if (currentStatus !== status) {
      // Status is changing, update status_updated_at
      updateQuery = 'UPDATE opportunities SET status = $1, status_updated_at = NOW(), updated_at = NOW() WHERE id = $2 RETURNING *';
      params = [status, id];
    } else {
      // Status not changing, just update updated_at
      updateQuery = 'UPDATE opportunities SET updated_at = NOW() WHERE id = $1 RETURNING *';
      params = [id];
    }

    const result = await query(updateQuery, params);

    // Auto-freeze check: if status has exceeded max time, move to frozen
    await checkAndAutoFreeze(id, status);

    res.json({
      success: true,
      opportunity: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating opportunity status:', error);
    res.status(500).json({ error: 'Failed to update opportunity status' });
  }
});

// Auto-freeze function: Check if status has exceeded max time and freeze if needed
async function checkAndAutoFreeze(opportunityId, currentStatus) {
  const MAX_DAYS_BY_STATUS = {
    'pending_contact': 5,
    'waiting_response': 5,
    'evolved': 5,
    'take_action': 5
  };

  const maxDays = MAX_DAYS_BY_STATUS[currentStatus];
  if (!maxDays) return; // Status doesn't have a time limit

  try {
    const result = await query(
      `SELECT status_updated_at FROM opportunities WHERE id = $1`,
      [opportunityId]
    );

    if (result.rows.length === 0) return;

    const statusUpdatedAt = new Date(result.rows[0].status_updated_at);
    const now = new Date();
    const diffDays = Math.floor((now - statusUpdatedAt) / (1000 * 60 * 60 * 24));

    if (diffDays > maxDays) {
      // Status has exceeded max time, freeze it
      await query(
        'UPDATE opportunities SET status = $1, status_updated_at = NOW(), updated_at = NOW() WHERE id = $2',
        ['frozen', opportunityId]
      );
      console.log(`Opportunity ${opportunityId} auto-frozen after ${diffDays} days in status ${currentStatus}`);
    }
  } catch (error) {
    console.error('Error checking auto-freeze:', error);
  }
}

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

    // Check if status is changing
    let statusChanged = false;
    if (status) {
      const currentOpp = await query(
        'SELECT status FROM opportunities WHERE id = $1',
        [id]
      );
      if (currentOpp.rows.length > 0 && currentOpp.rows[0].status !== status) {
        statusChanged = true;
      }
    }

    let updateFields = [];
    let params = [];
    let paramIndex = 1;

    if (email !== undefined) {
      updateFields.push(`email = $${paramIndex++}`);
      params.push(email);
    }
    if (phone !== undefined) {
      updateFields.push(`phone = $${paramIndex++}`);
      params.push(phone);
    }
    if (mobile !== undefined) {
      updateFields.push(`mobile = $${paramIndex++}`);
      params.push(mobile);
    }
    if (contact_name !== undefined) {
      updateFields.push(`contact_name = $${paramIndex++}`);
      params.push(contact_name);
    }
    if (messages !== undefined) {
      updateFields.push(`messages = $${paramIndex++}::text[]`);
      params.push(messages);
    }
    if (status !== undefined) {
      updateFields.push(`status = $${paramIndex++}`);
      params.push(status);
      if (statusChanged) {
        updateFields.push(`status_updated_at = NOW()`);
      }
    }
    if (property_id !== undefined) {
      updateFields.push(`property_id = $${paramIndex++}`);
      params.push(property_id);
    }
    if (metadata !== undefined) {
      updateFields.push(`metadata = $${paramIndex++}`);
      params.push(metadata ? JSON.stringify(metadata) : null);
    }

    updateFields.push(`updated_at = NOW()`);
    params.push(id);

    if (updateFields.length === 0) {
      // No fields to update
      const current = await query('SELECT * FROM opportunities WHERE id = $1', [id]);
      if (current.rows.length === 0) {
        return res.status(404).json({ error: 'Opportunity not found' });
      }
      return res.json({
        success: true,
        opportunity: current.rows[0]
      });
    }

    const result = await query(
      `UPDATE opportunities 
       SET ${updateFields.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    // Auto-freeze check if status was updated
    if (statusChanged && status) {
      await checkAndAutoFreeze(id, status);
    }

    // Re-fetch to get updated data
    const updated = await query('SELECT * FROM opportunities WHERE id = $1', [id]);

    res.json({
      success: true,
      opportunity: updated.rows[0]
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

    const result = await query(
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
    
    const result = await query(
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

// ============================================
// OPPORTUNITY NOTES API ENDPOINTS
// ============================================

// Get all notes for an opportunity
app.get('/opportunities/:id/notes', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT * FROM opportunity_notes WHERE opportunity_id = $1 ORDER BY created_at DESC',
      [id]
    );

    res.json({
      success: true,
      notes: result.rows
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Create a new note for an opportunity
app.post('/opportunities/:id/notes', async (req, res) => {
  try {
    const { id } = req.params;
    const { note, created_by } = req.body;

    if (!note || !note.trim()) {
      return res.status(400).json({ error: 'Note is required' });
    }

    // Verify opportunity exists
    const oppCheck = await query(
      'SELECT id FROM opportunities WHERE id = $1',
      [id]
    );

    if (oppCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    const result = await query(
      `INSERT INTO opportunity_notes (opportunity_id, note, created_by)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id, note.trim(), created_by || null]
    );

    res.status(201).json({
      success: true,
      note: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Update a note
app.put('/opportunities/:id/notes/:noteId', async (req, res) => {
  try {
    const { id, noteId } = req.params;
    const { note } = req.body;

    if (!note || !note.trim()) {
      return res.status(400).json({ error: 'Note is required' });
    }

    const result = await query(
      `UPDATE opportunity_notes 
       SET note = $1, updated_at = NOW()
       WHERE id = $2 AND opportunity_id = $3
       RETURNING *`,
      [note.trim(), noteId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({
      success: true,
      note: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Delete a note
app.delete('/opportunities/:id/notes/:noteId', async (req, res) => {
  try {
    const { id, noteId } = req.params;

    const result = await query(
      'DELETE FROM opportunity_notes WHERE id = $1 AND opportunity_id = $2 RETURNING *',
      [noteId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Failed to delete note' });
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

    const result = await query(
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

// =====================================================
// CHAT ENDPOINTS - User-based messaging
// =====================================================

// Get conversations (grouped by phone number, user-filtered)
app.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const userFilter = buildUserFilter(req.user);
    
    // Get all messages for this user, grouped by phone number
    const result = await query(
      `SELECT 
        message_from as "phoneNumber",
        MAX(datetime) as "lastMessageAt",
        COUNT(*) as "messageCount",
        MAX(message) as "lastMessage",
        MAX(category) as "category",
        MAX(user_id) as "userId"
      FROM whatsapp_messages
      WHERE ${userFilter.condition}
      GROUP BY message_from
      ORDER BY MAX(datetime) DESC`,
      userFilter.params
    );

    // Get full conversation for each phone number
    const conversations = await Promise.all(
      result.rows.map(async (conv) => {
        const messagesResult = await query(
          `SELECT 
            id,
            message_from as "messageFrom",
            message,
            datetime,
            message_type as "messageType",
            sent_by_user_id as "sentByUserId",
            user_id as "userId"
          FROM whatsapp_messages
          WHERE message_from = $1 AND ${userFilter.condition}
          ORDER BY datetime ASC`,
          [conv.phoneNumber, ...userFilter.params]
        );

        return {
          phoneNumber: conv.phoneNumber,
          lastMessageAt: conv.lastMessageAt,
          messageCount: parseInt(conv.messageCount),
          lastMessage: conv.lastMessage,
          category: conv.category,
          userId: conv.userId,
          messages: messagesResult.rows
        };
      })
    );

    res.json({
      total: conversations.length,
      conversations
    });
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({
      error: 'Failed to get conversations',
      details: error.message
    });
  }
});

// Get messages for a specific conversation
app.get('/conversations/:phoneNumber', authenticateToken, async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const userFilter = buildUserFilter(req.user);

    const result = await query(
      `SELECT 
        id,
        message_from as "messageFrom",
        message,
        datetime,
        message_type as "messageType",
        sent_by_user_id as "sentByUserId",
        user_id as "userId",
        category
      FROM whatsapp_messages
      WHERE message_from = $1 AND ${userFilter.condition}
      ORDER BY datetime ASC`,
      [phoneNumber, ...userFilter.params]
    );

    res.json({
      phoneNumber,
      total: result.rows.length,
      messages: result.rows
    });
  } catch (error) {
    console.error('Error getting conversation:', error);
    res.status(500).json({
      error: 'Failed to get conversation',
      details: error.message
    });
  }
});

// Send message via WhatsApp API
app.post('/send-message', authenticateToken, async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({
        error: 'phoneNumber and message are required'
      });
    }

    // Get WhatsApp API credentials
    const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
    const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
      return res.status(500).json({
        error: 'WhatsApp API credentials not configured'
      });
    }

    // Format phone number (remove +, spaces, etc.)
    const cleanPhone = phoneNumber.replace(/[\s\-\(\)\+]/g, '');

    // Send message via WhatsApp Cloud API
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: cleanPhone,
          type: 'text',
          text: {
            body: message
          }
        })
      }
    );

    const responseData = await response.json();

    if (!response.ok) {
      console.error('WhatsApp API error:', responseData);
      return res.status(response.status).json({
        error: 'Failed to send message via WhatsApp API',
        details: responseData
      });
    }

    // Save sent message to database
    const messageData = {
      messageFrom: cleanPhone,
      message: message,
      datetime: new Date().toISOString(),
      messageType: 'text',
      messageId: responseData.messages?.[0]?.id || null,
      category: 'UNCATEGORIZED',
      userId: req.user.id, // Assign conversation to this user
      sentByUserId: req.user.id // Track who sent it
    };

    await saveMessage(messageData);

    res.json({
      success: true,
      message: 'Message sent successfully',
      messageId: responseData.messages?.[0]?.id,
      data: messageData
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      error: 'Failed to send message',
      details: error.message
    });
  }
});

// Assign conversation to user (when user starts chatting)
app.post('/conversations/:phoneNumber/assign', authenticateToken, async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const userFilter = buildUserFilter(req.user);

    // Clean phone number for matching (remove +, spaces, etc.)
    const cleanPhone = phoneNumber.replace(/[\s\-\(\)\+]/g, '');

    // Update all messages from this phone number to be assigned to this user
    // Only update messages that are not already assigned to another user
    const messagesResult = await query(
      `UPDATE whatsapp_messages
       SET user_id = $1
       WHERE message_from = $2 AND (user_id IS NULL OR user_id = $1)
       RETURNING id`,
      [req.user.id, cleanPhone]
    );

    // Also assign related opportunities to this user
    // Match by phone or mobile number
    const opportunitiesResult = await query(
      `UPDATE opportunities
       SET user_id = $1, updated_at = NOW()
       WHERE (phone = $2 OR mobile = $2 OR phone = $3 OR mobile = $3)
         AND (user_id IS NULL OR user_id = $1)
       RETURNING id`,
      [req.user.id, cleanPhone, phoneNumber]
    );

    res.json({
      success: true,
      message: 'Conversation and related opportunities assigned to user',
      messagesAssigned: messagesResult.rows.length,
      opportunitiesAssigned: opportunitiesResult.rows.length
    });
  } catch (error) {
    console.error('Error assigning conversation:', error);
    res.status(500).json({
      error: 'Failed to assign conversation',
      details: error.message
    });
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
  console.log(`Verify token: ${VERIFY_TOKEN ? `${VERIFY_TOKEN.substring(0, 10)}...${VERIFY_TOKEN.substring(VERIFY_TOKEN.length - 10)}` : 'NOT SET'}`);
  console.log(`Verify token length: ${VERIFY_TOKEN ? VERIFY_TOKEN.length : 0}`);
  console.log(`Environment variables:`);
  console.log(`  WEBHOOK_VERIFY_TOKEN: ${process.env.WEBHOOK_VERIFY_TOKEN ? 'SET' : 'NOT SET'}`);
  console.log(`  VERIFY_TOKEN: ${process.env.VERIFY_TOKEN ? 'SET' : 'NOT SET'}`);
  console.log('================================================');
});

