// back-end/routes/auth.js

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database'); // sua instância SQLite configurada

const router = express.Router();

// --- Registro de usuário ---
router.post('/register', async (req, res) => {
  const {
    username,
    password,
    name,
    fullName,
    unit,
    lastUpdate = new Date().toISOString(),
    skills = {}
  } = req.body;

  // Validação básica dos campos obrigatórios
  if (!username || !password || !name || !fullName || !unit) {
    return res
      .status(400)
      .json({ message: 'Campos obrigatórios: username, password, name, fullName e unit.' });
  }

  try {
    // Hash da senha
    const hash = await bcrypt.hash(password, 10);

    // Monta o INSERT incluindo as colunas de skills como JSON
    const sql = `
      INSERT INTO users
        ( username
        , password_hash
        , name
        , fullName
        , unit
        , lastUpdate
        , backend
        , frontend
        , mobile
        , architecture
        , management
        , security
        , infra
        , data
        , immersive
        , marketing
        )
      VALUES ( ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,? )
    `;
    const params = [
      username,
      hash,
      name,
      fullName,
      unit,
      lastUpdate,
      JSON.stringify(skills.backend || []),
      JSON.stringify(skills.frontend || []),
      JSON.stringify(skills.mobile || []),
      JSON.stringify(skills.architecture || []),
      JSON.stringify(skills.management || []),
      JSON.stringify(skills.security || []),
      JSON.stringify(skills.infra || []),
      JSON.stringify(skills.data || []),
      JSON.stringify(skills.immersive || []),
      JSON.stringify(skills.marketing || [])
    ];

    db.run(sql, params, function (err) {
      if (err) {
        // Violação de UNIQUE no username?
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(409).json({ message: 'Username já existe.' });
        }
        console.error('Erro ao registrar usuário:', err);
        return res.status(500).json({ message: 'Erro interno ao registrar usuário.' });
      }
      return res
        .status(201)
        .json({ message: 'Usuário registrado com sucesso!', userId: this.lastID });
    });
  } catch (err) {
    console.error('Erro no hashing da senha:', err);
    return res.status(500).json({ message: 'Erro interno ao processar registro.' });
  }
});

// --- Login de usuário ---
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: 'Username e password são obrigatórios.' });
  }

  try {
    const sql = 'SELECT id, username, name, fullName, password_hash FROM users WHERE username = ?';
    db.get(sql, [username], async (err, user) => {
      if (err) {
        console.error('Erro ao buscar usuário:', err);
        return res.status(500).json({ message: 'Erro interno ao fazer login.' });
      }
      if (!user) {
        return res.status(401).json({ message: 'Usuário não encontrado.' });
      }

      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return res.status(401).json({ message: 'Senha incorreta.' });
      }

      // Gera token JWT
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
    });
  } catch (err) {
    console.error('Erro no processo de login:', err);
    return res.status(500).json({ message: 'Erro interno ao fazer login.' });
  }
});

module.exports = router;
