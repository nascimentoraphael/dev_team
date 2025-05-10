// back-end/middleware/authenticateToken.js

const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  // Suporta headers 'authorization' e 'Authorization'
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  // Extrai apenas o token (remove "Bearer ")
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : null;

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  try {
    // Isso lançará se o token for inválido ou expirado
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Armazena o payload (e.g. { id, username }) em req.user
    req.user = payload;
    next();
  } catch (err) {
    console.error('Token inválido ou expirado:', err.message);
    return res.status(403).json({ error: 'Token inválido ou expirado.' });
  }
}

module.exports = authenticateToken;
