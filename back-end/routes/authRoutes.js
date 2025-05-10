// back-end/routes/auth.js

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');

const router = express.Router();

// --- Registro (unchanged) ---
router.post('/register', async (req, res) => {
  // ... sua implementação atual de registro ...
});

// --- Login corrigido ---
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: 'Username e password são obrigatórios.' });
  }

  // Verifica se a chave existe
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET não definido em process.env');
    return res
      .status(500)
      .json({ message: 'Configuração de servidor inválida.' });
  }

  const sql = `
    SELECT id, username, name, fullName, password_hash
    FROM users
    WHERE username = ?
  `;

  db.get(sql, [username], async (err, user) => {
    if (err) {
      console.error('Erro ao buscar usuário no DB:', err.message);
      return res
        .status(500)
        .json({ message: 'Erro interno ao tentar fazer login.' });
    }

    if (!user) {
      return res
        .status(401)
        .json({ message: 'Usuário não encontrado.' });
    }

    try {
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return res
          .status(401)
          .json({ message: 'Senha incorreta.' });
      }

      // Gera o token JWT
      const payload = { id: user.id, username: user.username };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

      return res.json({
        message: 'Login bem-sucedido!',
        token,
        user: {
          id: user.id,
          name: user.name,
          fullName: user.fullName
        }
      });
    } catch (error) {
      console.error('Erro no callback de login:', error.message);
      return res
        .status(500)
        .json({ message: 'Erro interno ao processar login.' });
    }
  });
});

module.exports = router;
