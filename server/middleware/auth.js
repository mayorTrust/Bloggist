import crypto from 'crypto';

// In-memory set of active admin session tokens
const activeSessions = new Set();

export function createSessionToken() {
  const token = crypto.randomBytes(32).toString('hex');
  activeSessions.add(token);
  return token;
}

export function destroySessionToken(token) {
  if (token) {
    activeSessions.delete(token);
  }
}

export function isValidSession(token) {
  if (!token) return false;
  return activeSessions.has(token);
}

export function requireAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];
  const customHeader = req.headers['x-admin-token'];
  let token = customHeader;

  if (!token && authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  if (isValidSession(token)) {
    return next();
  }

  return res.status(401).json({ error: 'Unauthorized: Admin authentication required' });
}
