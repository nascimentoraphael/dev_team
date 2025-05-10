const express = require('express');
const db = require('../database');

const router = express.Router();

// Rota para buscar todos os membros da equipe
router.get('/', (req, res) => {
  const sql = "SELECT id, username, name, fullName, unit, lastUpdate, backend, frontend, mobile, architecture, management, security, infra, data, immersive, marketing FROM users";
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ "error": err.message });
      return;
    }
    // As colunas de skills são armazenadas como JSON string, precisamos parseá-las
    const teamMembers = rows.map(member => ({
      ...member,
      backend: JSON.parse(member.backend || '[]'),
      frontend: JSON.parse(member.frontend || '[]'),
      mobile: JSON.parse(member.mobile || '[]'),
      architecture: JSON.parse(member.architecture || '[]'),
      management: JSON.parse(member.management || '[]'),
      security: JSON.parse(member.security || '[]'),
      infra: JSON.parse(member.infra || '[]'),
      data: JSON.parse(member.data || '[]'),
      immersive: JSON.parse(member.immersive || '[]'),
      marketing: JSON.parse(member.marketing || '[]'),
    }));
    res.json(teamMembers);
  });
});

module.exports = router;