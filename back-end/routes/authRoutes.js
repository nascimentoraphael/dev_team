const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../database'); // Importa o pool de conexão com o PostgreSQL

const router = express.Router();

// Rota de Registro (opcional, mas útil para adicionar novos usuários)
router.post('/register', async (req, res) => {
  const { username, password, name, fullName, unit, lastUpdate = new Date().toISOString(), skills = {} } = req.body; // Adicionado 'unit'

  if (!username || !password || !name || !fullName || !unit) { // Adicionada verificação para 'unit'
    return res.status(400).json({ message: "Todos os campos (username, password, name, fullName, unit) são obrigatórios." });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    // Adicionada a coluna 'unit' e o placeholder correspondente
    const sql = `INSERT INTO users (username, password_hash, name, fullName, unit, lastUpdate, backend, frontend, mobile, architecture, management, security, infra, data, immersive, marketing)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING id`;
    const params = [
      username, hash, name, fullName, unit, lastUpdate, // Adicionado 'unit' aos parâmetros
      JSON.stringify(skills.backend || []), JSON.stringify(skills.frontend || []),
      JSON.stringify(skills.mobile || []), JSON.stringify(skills.architecture || []),
      JSON.stringify(skills.management || []), JSON.stringify(skills.security || []),
      JSON.stringify(skills.infra || []), JSON.stringify(skills.data || []),
      JSON.stringify(skills.immersive || []), JSON.stringify(skills.marketing || [])
    ];

    const result = await pool.query(sql, params);
    res.status(201).json({ message: "Usuário registrado com sucesso!", userId: result.rows[0].id });

  } catch (err) {
    if (err.code === '23505') { // Código de erro para violação de constraint UNIQUE no PostgreSQL
      return res.status(400).json({ message: "Nome de usuário já existe." });
    }
    console.error("Erro ao registrar usuário:", err);
    return res.status(500).json({ message: "Erro ao registrar usuário.", error: err.message });
  }
});

// Rota de Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Usuário e senha são obrigatórios." });
  }

  const sql = "SELECT * FROM users WHERE username = $1";
  try {
    const result = await pool.query(sql, [username]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: "Usuário não encontrado." });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (isMatch) {
      const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ message: "Login bem-sucedido!", token, user: { id: user.id, name: user.name, fullName: user.fullName } });
    } else {
      res.status(401).json({ message: "Senha incorreta." });
    }
  } catch (err) {
    console.error("Erro no login:", err);
    return res.status(500).json({ message: "Erro no servidor ao tentar fazer login.", error: err.message });
  }
});

module.exports = router;