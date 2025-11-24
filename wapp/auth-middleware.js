const jwt = require('jsonwebtoken');
const { query } = require('./db-connection');

// JWT secret - must match backend JWT_SECRET from .env
if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET environment variable is not set!');
  console.error('Please set JWT_SECRET in your .env file to match the backend service.');
  process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware to authenticate JWT token and extract user info
 * Adds req.user with { id, username, email, role }
 */
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('No token provided in Authorization header');
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    // Log JWT_SECRET length for debugging (don't log the actual secret)
    if (!JWT_SECRET) {
      console.error('JWT_SECRET is not set!');
      return res.status(500).json({ error: 'Server configuration error' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token verified successfully for userId:', decoded.userId);
    
    // Get user from database to check role
    const result = await query(
      'SELECT id, username, email, COALESCE(role, \'user\') as role FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      console.log('User not found in database for userId:', decoded.userId);
      return res.status(401).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role || 'user'
    };

    next();
  } catch (error) {
    console.error('JWT verification error:', error.message);
    console.error('JWT_SECRET length:', JWT_SECRET ? JWT_SECRET.length : 'undefined');
    return res.status(403).json({ error: 'Invalid or expired token', details: error.message });
  }
}

/**
 * Helper function to check if user can see all messages (admin/backoffice)
 */
function canSeeAllMessages(user) {
  return user && (user.role === 'admin' || user.role === 'backoffice');
}

/**
 * Helper function to build user filter for queries
 * Returns SQL condition and params array
 */
function buildUserFilter(user) {
  if (canSeeAllMessages(user)) {
    // Admin/backoffice can see all messages
    return { condition: '1=1', params: [] };
  } else {
    // Regular users can only see their own messages
    return {
      condition: '(user_id = $1 OR (user_id IS NULL AND sent_by_user_id = $1))',
      params: [user.id]
    };
  }
}

module.exports = {
  authenticateToken,
  canSeeAllMessages,
  buildUserFilter
};


