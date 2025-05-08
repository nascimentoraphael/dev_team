const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) {
    return res.sendStatus(401); // Se não há token, não autorizado
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("Erro na verificação do token:", err.message);
      return res.sendStatus(403); // Se o token não é válido, proibido
    }
    req.user = user; // Adiciona o payload do token (que inclui id e username) ao objeto req
    next(); // Passa para a próxima função de middleware ou rota
  });
}

module.exports = authenticateToken;