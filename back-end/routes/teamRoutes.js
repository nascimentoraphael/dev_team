const express = require('express');
const db = require('../postgresClient.js'); // Importa a conexão com o banco de dados

const router = express.Router();

// Rota para buscar todos os membros da equipe
router.get('/', async (req, res) => {
  try {
    const queryText = "SELECT id, username, name, fullName, unit, lastUpdate, backend, frontend, mobile, architecture, management, security, infra, data, immersive, marketing FROM users";
    const result = await db.unsafe(queryText); // or await db`SELECT ... FROM users`

    // As colunas de skills são armazenadas como JSON string, precisamos parseá-las
    // With 'postgres' library, result is directly the array of rows
    const teamMembers = result.map(member => ({
      ...member,
      // JSON.parse should not be needed if your DB returns JSONB as objects already,
      // but if they are strings, then parse. 'postgres' lib often auto-parses JSON/JSONB.
      // Assuming they might still be strings from the previous setup:
      backend: typeof member.backend === 'string' ? JSON.parse(member.backend || '[]') : (member.backend || []),
      frontend: typeof member.frontend === 'string' ? JSON.parse(member.frontend || '[]') : (member.frontend || []),
      mobile: typeof member.mobile === 'string' ? JSON.parse(member.mobile || '[]') : (member.mobile || []),
      architecture: typeof member.architecture === 'string' ? JSON.parse(member.architecture || '[]') : (member.architecture || []),
      management: typeof member.management === 'string' ? JSON.parse(member.management || '[]') : (member.management || []),
      security: typeof member.security === 'string' ? JSON.parse(member.security || '[]') : (member.security || []),
      infra: typeof member.infra === 'string' ? JSON.parse(member.infra || '[]') : (member.infra || []),
      data: typeof member.data === 'string' ? JSON.parse(member.data || '[]') : (member.data || []),
      immersive: typeof member.immersive === 'string' ? JSON.parse(member.immersive || '[]') : (member.immersive || []),
      marketing: typeof member.marketing === 'string' ? JSON.parse(member.marketing || '[]') : (member.marketing || []),
    }));
    res.json(teamMembers);
  } catch (err) {
    res.status(500).json({ "error": err.message });
  }
});

module.exports = router;