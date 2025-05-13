const express = require('express');
const pool = require('../database'); // Alterado para pool do PostgreSQL
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

// Rota para buscar o perfil do usuário autenticado
router.get('/me/profile', authenticateToken, (req, res) => {
  // req.user foi adicionado pelo middleware authenticateToken e contém o id do usuário
  const userId = parseInt(req.user.id, 10); // Garante que é um número

  const sql = "SELECT id, username, name, fullName, unit, lastUpdate, backend, frontend, mobile, architecture, management, security, infra, data, immersive, marketing FROM users WHERE id = $1";
  pool.query(sql, [userId])
    .then(result => {
      const row = result.rows[0];
      if (!row) {
        return res.status(404).json({ "message": "Perfil do usuário não encontrado." });
      }
      // As colunas de skills são armazenadas como JSON string, precisamos parseá-las
      const userProfile = {
        ...row,
        ...Object.fromEntries(Object.entries(row).map(([key, value]) => [key, ['backend', 'frontend', 'mobile', 'architecture', 'management', 'security', 'infra', 'data', 'immersive', 'marketing'].includes(key) ? JSON.parse(value || '[]') : value]))
      };
      res.json(userProfile);
    })
    .catch(err => {
      console.error("Erro ao buscar perfil do usuário:", err);
      res.status(500).json({ "error": err.message });
    });
});

// Rota para atualizar as habilidades do usuário autenticado
router.put('/me/profile/skills', authenticateToken, async (req, res) => {
  const userId = parseInt(req.user.id, 10);
  const { skills } = req.body; // Espera um objeto como: { backend: [{skillName: "Java", skillLevel: 3}], frontend: [...] }

  console.log('[UserRoutes] Atualizando skills para userID:', userId);
  console.log('[UserRoutes] Skills recebidas:', JSON.stringify(skills, null, 2));

  if (!skills || typeof skills !== 'object') {
    return res.status(400).json({ message: "Formato de habilidades inválido." });
  }
  try {
    // Validar e preparar os campos de skills para o update
    const skillCategories = ['backend', 'frontend', 'mobile', 'architecture', 'management', 'security', 'infra', 'data', 'immersive', 'marketing'];
    let setClauses = [];
    let params = [];
    let paramIndex = 1;

    skillCategories.forEach(category => {
      if (skills[category] !== undefined) { // Verifica se a categoria de skill foi enviada
        setClauses.push(`${category} = $${paramIndex++}`);
        // Garante que mesmo um array vazio seja stringificado corretamente
        params.push(JSON.stringify(skills[category] || []));
      }
    });

    // Adiciona lastUpdate aos campos a serem atualizados
    setClauses.push(`lastUpdate = $${paramIndex++}`);
    params.push(new Date().toISOString());

    if (setClauses.length <= 1) { // Ajustado para <= 1 pois sempre teremos lastUpdate
      return res.status(400).json({ message: "Nenhuma habilidade fornecida para atualização." });
    }

    params.push(userId); // Adiciona o userId ao final para a cláusula WHERE
    const sql = `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${paramIndex}`;

    const result = await pool.query(sql, params);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Usuário não encontrado para atualização de skills." });
    }
    console.log('[UserRoutes] Skills atualizadas com sucesso para userID:', userId);
    res.json({ message: "Habilidades atualizadas com sucesso!" });
  } catch (err) {
    console.error('[UserRoutes] Erro ao atualizar skills no DB:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Rota para o admin editar um usuário (fullName, username/email, unit)
router.put('/:id', authenticateToken, async (req, res) => {
  // Verifica se o requisitante é o admin
  if (req.user.username !== 'admin@example.com') {
    return res.status(403).json({ message: "Acesso negado. Apenas administradores podem editar usuários." });
  }

  const userIdToEdit = parseInt(req.params.id, 10);
  const { fullName, email, unit } = req.body; // username no frontend é o email

  if (!fullName || !email || !unit) {
    return res.status(400).json({ message: "Nome completo, email e unidade são obrigatórios." });
  }

  // Não permitir que o admin edite seu próprio email para algo diferente de admin@example.com
  // ou que edite o ID 1 (assumindo que o admin é o ID 1 e seu email não pode mudar)
  if (parseInt(userIdToEdit) === req.user.id && email !== 'admin@example.com') {
    return res.status(400).json({ message: "O email do administrador principal não pode ser alterado." });
  }

  const sql = `UPDATE users SET fullName = $1, username = $2, unit = $3, name = $4, lastUpdate = $5 WHERE id = $6`;
  const name = fullName.split(' ')[0]; // Pega o primeiro nome
  const lastUpdate = new Date().toISOString();

  try {
    const result = await pool.query(sql, [fullName, email, unit, name, lastUpdate, userIdToEdit]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Usuário não encontrado para edição." });
    }
    console.log('[UserRoutes] Usuário ID:', userIdToEdit, 'editado com sucesso pelo admin ID:', req.user.id);
    res.json({ message: "Usuário atualizado com sucesso!" });
  } catch (err) {
    if (err.code === '23505') { // UNIQUE constraint failed
      return res.status(400).json({ message: "O novo email (username) já está em uso." });
    }
    console.error('[UserRoutes] Erro ao editar usuário no DB:', err.message);
    return res.status(500).json({ error: "Erro ao atualizar usuário: " + err.message });
  }
});

// Rota para o admin excluir um usuário
router.delete('/:id', authenticateToken, async (req, res) => {
  // Verifica se o requisitante é o admin
  if (req.user.username !== 'admin@example.com') {
    return res.status(403).json({ message: "Acesso negado. Apenas administradores podem excluir usuários." });
  }

  const userIdToDelete = parseInt(req.params.id, 10);

  // Prevenir que o admin se auto-exclua (assumindo que o ID do admin é conhecido ou comparando com req.user.id)
  if (parseInt(userIdToDelete) === req.user.id) {
    return res.status(400).json({ message: "O administrador não pode se auto-excluir." });
  }

  const sql = 'DELETE FROM users WHERE id = $1';
  try {
    const result = await pool.query(sql, [userIdToDelete]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Usuário não encontrado para exclusão." });
    }
    console.log('[UserRoutes] Usuário ID:', userIdToDelete, 'excluído com sucesso pelo admin ID:', req.user.id);
    res.json({ message: "Usuário excluído com sucesso!" });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao excluir usuário: " + err.message });
  }
});

module.exports = router;