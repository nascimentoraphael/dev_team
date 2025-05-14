const express = require('express');
const db = require('../postgresClient.js'); // Importa a conexão com o banco de dados

const router = express.Router();

const DB_SKILL_COLUMNS = ['backend', 'frontend', 'mobile', 'architecture', 'management', 'security', 'infra', 'data', 'immersive', 'marketing', 'blockchain'];

// Rota para buscar todos os membros da equipe
router.get('/', async (req, res) => {
  try {
    const queryText = `SELECT id, username, name, "fullName", unit, lastUpdate, ${DB_SKILL_COLUMNS.join(', ')} FROM users`;
    const result = await db.query(queryText);

    // Com 'pg', os resultados estão em result.rows
    const teamMembers = result.rows.map(member => ({
      ...member,
      // JSON.parse should not be needed if your DB returns JSONB as objects already,
      // but if they are strings, then parse. 'postgres' lib often auto-parses JSON/JSONB.
      // Assuming they might still be strings from the previous setup or for consistency:
      ...DB_SKILL_COLUMNS.reduce((acc, key) => {
        acc[key] = typeof member[key] === 'string' ? JSON.parse(member[key] || '[]') : (member[key] || []);
        return acc;
      }, {})
    }));
    res.json(teamMembers);
  } catch (err) {
    res.status(500).json({ "error": err.message });
  }
});

module.exports = router;