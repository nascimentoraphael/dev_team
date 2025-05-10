const serverless = require('serverless-http');
const app = require('../back-end/server');

module.exports = serverless(app);