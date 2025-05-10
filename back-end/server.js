require('dotenv').config(); // Carrega variáveis de ambiente do .env
const express = require('express');
const cors = require('cors');
const db = require('./database'); // Importa a configuração do banco de dados (e inicializa)

const authRoutes = require('./routes/authRoutes');
const teamRoutes = require('./routes/teamRoutes');
const userRoutes = require('./routes/userRoutes'); // Importar userRoutes

const app = express();

// Middlewares
app.use(cors()); // Habilita CORS para todas as origens
app.use(express.json()); // Para parsear JSON no corpo das requisições

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/users', userRoutes); // Adicionar userRoutes

// Rota raiz para teste
app.get('/', (req, res) => {
  res.json({ message: "Bem-vindo à API da Equipe de Desenvolvimento!" });
});

const PORT = process.env.PORT || 3000;

  console.log(`Servidor rodando na porta ${PORT}`);
  // Uma pequena verificação para garantir que o DB está conectado após o servidor iniciar
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, row) => {
    if (row) console.log("Conexão com o banco de dados e tabela 'users' verificada.");
    else console.error("Tabela 'users' não encontrada no banco de dados.", err);
  });
});
module.exports = app;
