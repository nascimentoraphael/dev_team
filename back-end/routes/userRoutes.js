const express = require('express');
const db = require('../database');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

// Rota para buscar o perfil do usuário autenticado
router.get('/me/profile', authenticateToken, (req, res) => {
  // req.user foi adicionado pelo middleware authenticateToken e contém o id do usuário
  const userId = req.user.id;

  const sql = "SELECT id, name, fullName, lastUpdate, backend, frontend, mobile, architecture, management, security, infra, data, immersive, marketing FROM users WHERE id = ?";
  db.get(sql, [userId], (err, row) => {
    if (err) {
      res.status(500).json({ "error": err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ "message": "Perfil do usuário não encontrado." });
      return;
    }
    // As colunas de skills são armazenadas como JSON string, precisamos parseá-las
    const userProfile = {
      ...row,
      ...Object.fromEntries(Object.entries(row).map(([key, value]) => [key, ['backend', 'frontend', 'mobile', 'architecture', 'management', 'security', 'infra', 'data', 'immersive', 'marketing'].includes(key) ? JSON.parse(value || '[]') : value]))
    };
    res.json(userProfile);
  });
});

// Rota para atualizar as habilidades do usuário autenticado
router.put('/me/profile/skills', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { skills } = req.body; // Espera um objeto como: { backend: [{skillName: "Java", skillLevel: 3}], frontend: [...] }

  console.log('[UserRoutes] Atualizando skills para userID:', userId);
  console.log('[UserRoutes] Skills recebidas:', JSON.stringify(skills, null, 2));

  if (!skills || typeof skills !== 'object') {
    return res.status(400).json({ message: "Formato de habilidades inválido." });
  }

  // Validar e preparar os campos de skills para o update
  const skillCategories = ['backend', 'frontend', 'mobile', 'architecture', 'management', 'security', 'infra', 'data', 'immersive', 'marketing'];
  let setClauses = [];
  let params = [];

  skillCategories.forEach(category => {
    if (skills[category] !== undefined) { // Verifica se a categoria de skill foi enviada
      setClauses.push(`${category} = ?`);
      // Garante que mesmo um array vazio seja stringificado corretamente
      params.push(JSON.stringify(skills[category] || []));
    }
  });

  // Adiciona lastUpdate aos campos a serem atualizados
  setClauses.push('lastUpdate = ?');
  params.push(new Date().toISOString());

  if (setClauses.length === 0) {
    return res.status(400).json({ message: "Nenhuma habilidade fornecida para atualização." });
  }

  params.push(userId); // Adiciona o userId ao final para a cláusula WHERE
  const sql = `UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`;

  db.run(sql, params, function (err) {
    if (err) {
      console.error('[UserRoutes] Erro ao atualizar skills no DB:', err.message);
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "Usuário não encontrado para atualização de skills." });
    }
    console.log('[UserRoutes] Skills atualizadas com sucesso para userID:', userId);
    res.json({ message: "Habilidades atualizadas com sucesso!" });
  });
});

module.exports = router;