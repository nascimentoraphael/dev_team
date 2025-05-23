const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database'); // Importa a conexão com o banco de dados

const router = express.Router();

// Rota de Registro (opcional, mas útil para adicionar novos usuários)
router.post('/register', (req, res) => {
  const { username, password, name, fullName, unit, lastUpdate = new Date().toISOString(), skills = {} } = req.body; // Adicionado 'unit'

  if (!username || !password || !name || !fullName || !unit) { // Adicionada verificação para 'unit'
    return res.status(400).json({ message: "Todos os campos (username, password, name, fullName, unit) são obrigatórios." });
  }

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({ message: "Erro ao gerar hash da senha." });
    }
    // Adicionada a coluna 'unit' e o placeholder correspondente
    const sql = `INSERT INTO users (username, password_hash, name, fullName, unit, lastUpdate, backend, frontend, mobile, architecture, management, security, infra, data, immersive, marketing) 
                     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    const params = [
      username, hash, name, fullName, unit, lastUpdate, // Adicionado 'unit' aos parâmetros
      JSON.stringify(skills.backend || []), JSON.stringify(skills.frontend || []),
      JSON.stringify(skills.mobile || []), JSON.stringify(skills.architecture || []),
      JSON.stringify(skills.management || []), JSON.stringify(skills.security || []),
      JSON.stringify(skills.infra || []), JSON.stringify(skills.data || []),
      JSON.stringify(skills.immersive || []), JSON.stringify(skills.marketing || [])
    ];

    db.run(sql, params, function (err) {
      if (err) {
        if (err.message.includes("UNIQUE constraint failed")) {
          return res.status(400).json({ message: "Nome de usuário já existe." });
        }
        return res.status(500).json({ message: "Erro ao registrar usuário.", error: err.message });
      }
      res.status(201).json({ message: "Usuário registrado com sucesso!", userId: this.lastID });
    });
  });
});

// Rota de Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Usuário e senha são obrigatórios." });
  }

  const sql = "SELECT * FROM users WHERE username = ?";
  db.get(sql, [username], (err, user) => {
    if (err) {
      return res.status(500).json({ message: "Erro no servidor ao tentar fazer login." });
    }
    if (!user) {
      return res.status(401).json({ message: "Usuário não encontrado." });
    }

    bcrypt.compare(password, user.password_hash, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ message: "Erro ao verificar senha." });
      }
      if (isMatch) {
        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: "Login bem-sucedido!", token, user: { id: user.id, name: user.name, fullName: user.fullName } });
      } else {
        res.status(401).json({ message: "Senha incorreta." });
      }
    });
  });
});

module.exports = router;