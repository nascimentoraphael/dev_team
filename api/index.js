// api/index.js
const serverless = require('serverless-http');
const app = require('../back-end/server');

// <<< ADICIONE ISTO Logo Abaixo >>>
app.get('/api/ping', (req, res) => {
  return res.json({ pong: true });
});

module.exports = serverless(app);
