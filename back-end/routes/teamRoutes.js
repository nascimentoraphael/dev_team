const express = require('express');
const pool = require('../database'); // Alterado para pool do PostgreSQL

const router = express.Router();

// Rota para buscar todos os membros da equipe
router.get('/', async (req, res) => {
  const sql = "SELECT id, username, name, fullName, unit, lastUpdate, backend, frontend, mobile, architecture, management, security, infra, data, immersive, marketing FROM users";
  try {
    const result = await pool.query(sql);
    const rows = result.rows;

    // As colunas de skills são armazenadas como JSON string, precisamos parseá-las
    const teamMembers = rows.map(member => ({
      ...member,
      // Garante que o parse só ocorra se o valor não for null e for uma string JSON válida
      backend: member.backend ? JSON.parse(member.backend) : [],
      frontend: member.frontend ? JSON.parse(member.frontend) : [],
      mobile: member.mobile ? JSON.parse(member.mobile) : [],
      architecture: member.architecture ? JSON.parse(member.architecture) : [],
      management: member.management ? JSON.parse(member.management) : [],
      security: member.security ? JSON.parse(member.security) : [],
      infra: member.infra ? JSON.parse(member.infra) : [],
      data: member.data ? JSON.parse(member.data) : [],
      immersive: member.immersive ? JSON.parse(member.immersive) : [],
      marketing: member.marketing ? JSON.parse(member.marketing) : [],
    }));
    res.json(teamMembers);
  } catch (err) {
    console.error("Erro ao buscar membros da equipe:", err);
    res.status(500).json({ "error": err.message });
  }
});

module.exports = router;