require('dotenv').config(); // Carrega variáveis de ambiente do .env
const express = require('express');
const cors = require('cors');
const pool = require('./postgresClient.js'); // Importa a configuração do banco de dados (e inicializa)

const authRoutes = require('./routes/authRoutes');
const teamRoutes = require('./routes/teamRoutes');
const userRoutes = require('./routes/userRoutes'); // Importar userRoutes

const app = express();

// Middlewares
// app.use(cors()); // Habilita CORS para todas as origens - Opção anterior
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // Permite o URL do frontend ou qualquer origem se não definido
  optionsSuccessStatus: 200
}));

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

app.listen(PORT, async () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  // Uma pequena verificação para garantir que o DB está conectado após o servidor iniciar
  try {
    // Tenta fazer uma query simples para verificar a conexão e a existência da tabela
    const res = await pool.query("SELECT to_regclass('public.users')");
    if (res.rows[0].to_regclass) {
      console.log("Conexão com o banco de dados PostgreSQL e tabela 'users' verificada.");
    } else {
      console.error("Tabela 'users' não encontrada no banco de dados PostgreSQL.");
    }
  } catch (err) {
    console.error("Erro ao verificar conexão com o banco de dados PostgreSQL:", err.message);
  }
});