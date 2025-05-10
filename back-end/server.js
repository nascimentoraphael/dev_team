// back-end/server.js

require('dotenv').config();               // Carrega variáveis de ambiente
const express = require('express');
const cors = require('cors');
const db = require('./database');         // Configuração e conexão SQLite

const authRoutes = require('./routes/auth');
const teamRoutes = require('./routes/team');
const userRoutes = require('./routes/user');

const app = express();

// Middlewares
app.use(cors());                          // Habilita CORS para todas as origens
app.use(express.json());                  // Parse de JSON no corpo das requisições

// Rotas públicas
app.use('/api/auth', authRoutes);

// Rotas protegidas / compartilhadas
app.use('/api/team', teamRoutes);
app.use('/api/users', userRoutes);

// Rota raiz apenas para teste
app.get('/', (req, res) => {
  res.json({ message: 'Bem-vindo à API da Equipe de Desenvolvimento!' });
});

// Verificação de tabela no banco de dados
db.get(
  "SELECT name FROM sqlite_master WHERE type='table' AND name='users'",
  (err, row) => {
    if (err) {
      console.error("Erro ao verificar tabela 'users':", err.message);
    } else if (!row) {
      console.error("Tabela 'users' não encontrada no banco de dados.");
    } else {
      console.log("Conexão com o banco OK e tabela 'users' encontrada.");
    }
  }
);

// Somente em ambiente de desenvolvimento local iniciamos o listener
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

app.get('/api/ping', (req, res) => {
  res.json({ pong: true });
});

module.exports = app;
