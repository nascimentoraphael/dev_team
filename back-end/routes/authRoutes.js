const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../postgresClient.js');// Importa a conexão com o banco de dados
const defaultSkillCategories = require('../skillCategories.json'); // Carrega as skills padrão

const router = express.Router();

// Rota de Registro (opcional, mas útil para adicionar novos usuários)
router.post('/register', async (req, res) => {
  const { username, password, name, fullName, unit, lastUpdate = new Date().toISOString(), skills } = req.body; // skills pode ser undefined

  if (!username || !password || !name || !fullName || !unit) { // Adicionada verificação para 'unit'
    return res.status(400).json({ message: "Todos os campos (username, password, name, fullName, unit) são obrigatórios." });
  }

  try {
    const hash = await bcrypt.hash(password, 10);

    // Usar skills do request se fornecidas e completas, senão usar as defaultSkillCategories
    const finalSkills = {
      backend: (skills && skills.backend && skills.backend.length > 0) ? skills.backend : defaultSkillCategories.backend,
      frontend: (skills && skills.frontend && skills.frontend.length > 0) ? skills.frontend : defaultSkillCategories.frontend,
      mobile: (skills && skills.mobile && skills.mobile.length > 0) ? skills.mobile : defaultSkillCategories.mobile,
      architecture: (skills && skills.architecture && skills.architecture.length > 0) ? skills.architecture : defaultSkillCategories.architecture,
      management: (skills && skills.management && skills.management.length > 0) ? skills.management : defaultSkillCategories.management,
      security: (skills && skills.security && skills.security.length > 0) ? skills.security : defaultSkillCategories.security,
      infra: (skills && skills.infra && skills.infra.length > 0) ? skills.infra : defaultSkillCategories.infra,
      data: (skills && skills.data && skills.data.length > 0) ? skills.data : defaultSkillCategories.data,
      immersive: (skills && skills.immersive && skills.immersive.length > 0) ? skills.immersive : defaultSkillCategories.immersive,
      marketing: (skills && skills.marketing && skills.marketing.length > 0) ? skills.marketing : defaultSkillCategories.marketing,
    };

    // Adicionada a coluna 'unit' e placeholders ajustados para PostgreSQL, e RETURNING id
    const queryText = `INSERT INTO users (username, password_hash, name, "fullName", unit, lastUpdate, backend, frontend, mobile, architecture, management, security, infra, data, immersive, marketing)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING id`;
    const values = [
      username, hash, name, fullName, unit, lastUpdate,
      JSON.stringify(finalSkills.backend || []), JSON.stringify(finalSkills.frontend || []),
      JSON.stringify(finalSkills.mobile || []), JSON.stringify(finalSkills.architecture || []),
      JSON.stringify(finalSkills.management || []), JSON.stringify(finalSkills.security || []),
      JSON.stringify(finalSkills.infra || []), JSON.stringify(finalSkills.data || []),
      JSON.stringify(finalSkills.immersive || []), JSON.stringify(finalSkills.marketing || [])
    ];
    const result = await db.query(queryText, values);
    res.status(201).json({ message: "Usuário registrado com sucesso!", userId: result.rows[0].id });
  } catch (err) {
    if (err.code === '23505') { // unique_violation
      return res.status(400).json({ message: "Nome de usuário já existe." });
    }
    if (err instanceof bcrypt.CompareError) { // Error from bcrypt.hash
      return res.status(500).json({ message: "Erro ao gerar hash da senha." });
    }
    return res.status(500).json({ message: "Erro ao registrar usuário.", error: err.message });
  }
});

// Rota de Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Usuário e senha são obrigatórios." });
  }

  try {
    // Selecionar explicitamente com aspas garante o case, ou confiar que SELECT * com coluna citada na criação funcione.
    const queryText = `SELECT id, username, password_hash, name, "fullName", unit, lastUpdate, backend, frontend, mobile, architecture, management, security, infra, data, immersive, marketing FROM users WHERE username = $1`;
    const result = await db.query(queryText, [username]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: "Usuário não encontrado ou senha incorreta." }); // Mensagem genérica por segurança
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (isMatch) {
      const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ message: "Login bem-sucedido!", token, user: { id: user.id, name: user.name, fullName: user.fullName } });
    } else {
      res.status(401).json({ message: "Senha incorreta." });
    }
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Erro no servidor ao tentar fazer login.", error: err.message });
  }
});

module.exports = router;