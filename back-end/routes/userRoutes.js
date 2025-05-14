const express = require('express');
const db = require('../postgresClient.js'); // Importa a conexão com o banco de dados
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

// Rota para buscar o perfil do usuário autenticado
router.get('/me/profile', authenticateToken, async (req, res) => {
  // req.user foi adicionado pelo middleware authenticateToken e contém o id do usuário
  const userId = req.user.id;

  try {
    const queryText = `SELECT id, username, name, "fullName", unit, lastUpdate, backend, frontend, mobile, architecture, management, security, infra, data, immersive, marketing FROM users WHERE id = $1`;
    const result = await db.query(queryText, [userId]);
    const row = result.rows[0];

    if (!row) {
      res.status(404).json({ "message": "Perfil do usuário não encontrado." });
      return;
    }
    // As colunas de skills são armazenadas como JSON string, precisamos parseá-las
    // 'postgres' library often auto-parses JSON/JSONB types. If not, manual parsing is needed.
    const userProfile = {
      ...row,
      ...Object.fromEntries(Object.entries(row).map(([key, value]) => {
        if (['backend', 'frontend', 'mobile', 'architecture', 'management', 'security', 'infra', 'data', 'immersive', 'marketing'].includes(key)) {
          return [key, typeof value === 'string' ? JSON.parse(value || '[]') : (value || [])];
        }
        return [key, value];
      }))
    };
    res.json(userProfile);
  } catch (err) {
    res.status(500).json({ "error": err.message });
  }
});

// Rota para atualizar as habilidades do usuário autenticado
router.put('/me/profile/skills', authenticateToken, async (req, res) => {
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
  let queryParams = [];
  let paramIndex = 1;

  skillCategories.forEach(category => {
    if (skills[category] !== undefined) { // Verifica se a categoria de skill foi enviada
      setClauses.push(`${category} = $${paramIndex++}`);
      queryParams.push(JSON.stringify(skills[category] || []));
    }
  });

  // Adiciona lastUpdate aos campos a serem atualizados
  setClauses.push(`lastUpdate = $${paramIndex++}`);
  queryParams.push(new Date().toISOString());

  // Se apenas lastUpdate está sendo setado, significa que nenhuma skill foi enviada.
  if (setClauses.length <= 1) { // Ajustado para <= 1 pois sempre teremos lastUpdate
    return res.status(400).json({ message: "Nenhuma habilidade fornecida para atualização." });
  }

  const queryText = `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${paramIndex}`;
  queryParams.push(userId);

  try {
    const result = await db.query(queryText, queryParams);

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
  if (req.user.username !== 'admin@sp.senai.br') {
    return res.status(403).json({ message: "Acesso negado. Apenas administradores podem editar usuários." });
  }

  const userIdToEdit = req.params.id;
  const { fullName, email, unit } = req.body; // username no frontend é o email

  if (!fullName || !email || unit === undefined || unit === null) { // unit pode ser string vazia, mas deve existir
    return res.status(400).json({ message: "Nome completo, email e unidade são obrigatórios." });
  }

  // Não permitir que o admin edite seu próprio email para algo diferente de admin@example.com
  // ou que edite o ID do admin (req.user.id) para um email diferente de admin@senai.br
  if (parseInt(userIdToEdit) === req.user.id && email !== 'admin@senai.br') {
    return res.status(400).json({ message: "O email do administrador principal não pode ser alterado." });
  }

  const name = fullName.split(' ')[0]; // Pega o primeiro nome
  const lastUpdate = new Date().toISOString();

  try {
    const queryText = `UPDATE users SET "fullName" = $1, username = $2, unit = $3, name = $4, lastUpdate = $5 WHERE id = $6`;
    const result = await db.query(queryText, [fullName, email, unit, name, lastUpdate, userIdToEdit]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Usuário não encontrado para edição." });
    }
    console.log('[UserRoutes] Usuário ID:', userIdToEdit, 'editado com sucesso pelo admin ID:', req.user.id);
    res.json({ message: "Usuário atualizado com sucesso!" });
  } catch (err) {
    if (err.code === '23505') { // unique_violation
      return res.status(400).json({ message: "O novo email (username) já está em uso." });
    }
    console.error('[UserRoutes] Erro ao editar usuário no DB:', err.message);
    return res.status(500).json({ error: "Erro ao atualizar usuário: " + err.message });
  }
});

// Rota para o admin excluir um usuário
router.delete('/:id', authenticateToken, async (req, res) => {
  // Verifica se o requisitante é o admin
  if (req.user.username !== 'admin@sp.senai.br') {
    return res.status(403).json({ message: "Acesso negado. Apenas administradores podem excluir usuários." });
  }

  const userIdToDelete = req.params.id;

  // Prevenir que o admin se auto-exclua (assumindo que o ID do admin é conhecido ou comparando com req.user.id)
  if (parseInt(userIdToDelete) === req.user.id) {
    return res.status(400).json({ message: "O administrador não pode se auto-excluir." });
  }

  try {
    const queryText = "DELETE FROM users WHERE id = $1";
    const result = await db.query(queryText, [userIdToDelete]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Usuário não encontrado para exclusão." });
    }
    console.log('[UserRoutes] Usuário ID:', userIdToDelete, 'excluído com sucesso pelo admin ID:', req.user.id);
    res.json({ message: "Usuário excluído com sucesso!" });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao excluir usuário: " + err.message });
  }
});

// Rota para o ADMIN atualizar as habilidades de um usuário específico
router.put('/:userId/skills', authenticateToken, async (req, res) => {
  // 1. Verificar se o requisitante é admin
  if (req.user.username !== 'admin@sp.senai.br') {
    return res.status(403).json({ message: "Acesso negado. Apenas administradores podem realizar esta ação." });
  }

  const targetUserId = req.params.userId;
  const { skills } = req.body;

  // 2. Opcional: Impedir que o admin edite a si mesmo por esta rota (ele deve usar /me/profile/skills)
  //    Isso é mais uma regra de consistência.
  if (req.user.id.toString() === targetUserId) {
    return res.status(400).json({ message: "Para editar suas próprias habilidades, use o endpoint /me/profile/skills. Esta rota é para editar outros usuários." });
  }

  console.log(`[Admin UserRoutes] Admin ${req.user.username} (ID: ${req.user.id}) está atualizando skills para userID: ${targetUserId}`);
  console.log('[Admin UserRoutes] Skills recebidas:', JSON.stringify(skills, null, 2));

  if (!skills || typeof skills !== 'object') {
    return res.status(400).json({ message: "Formato de habilidades inválido." });
  }

  const skillCategories = ['backend', 'frontend', 'mobile', 'architecture', 'management', 'security', 'infra', 'data', 'immersive', 'marketing'];
  let setClauses = [];
  let queryParams = [];
  let paramIndex = 1;

  skillCategories.forEach(category => {
    if (skills[category] !== undefined) { // Verifica se a categoria de skill foi enviada
      setClauses.push(`${category} = $${paramIndex++}`);
      queryParams.push(JSON.stringify(skills[category] || []));
    }
  });

  setClauses.push(`lastUpdate = $${paramIndex++}`);
  queryParams.push(new Date().toISOString());

  if (setClauses.length <= 1) { // Se apenas lastUpdate está sendo setado
    return res.status(400).json({ message: "Nenhuma habilidade fornecida para atualização." });
  }

  const queryText = `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${paramIndex}`;
  queryParams.push(targetUserId);

  try {
    const result = await db.query(queryText, queryParams);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Usuário alvo não encontrado para atualização de skills." });
    }
    console.log(`[Admin UserRoutes] Skills atualizadas com sucesso para userID: ${targetUserId} pelo Admin ${req.user.username}`);
    res.json({ message: `Habilidades do usuário (ID: ${targetUserId}) atualizadas com sucesso!` });
  } catch (err) {
    console.error('[Admin UserRoutes] Erro ao atualizar skills no DB para userID ' + targetUserId + ':', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Rota para o usuário alterar sua própria senha
router.put('/me/password', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: "Senha antiga e nova senha são obrigatórias." });
  }

  try {
    // 1. Verificar a senha antiga
    const queryText = `SELECT password_hash FROM users WHERE id = $1`;
    const result = await db.query(queryText, [userId]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Senha antiga incorreta." });
    }

    // 2. Fazer o hash da nova senha
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // 3. Atualizar a senha no banco de dados
    const updateQueryText = `UPDATE users SET password_hash = $1, lastUpdate = $2 WHERE id = $3`;
    await db.query(updateQueryText, [newPasswordHash, new Date().toISOString(), userId]);

    res.json({ message: "Senha alterada com sucesso!" });
  } catch (err) {
    console.error("Erro ao alterar senha:", err);
    return res.status(500).json({ error: "Erro ao alterar senha: " + err.message });
  }
});

const bcrypt = require('bcryptjs'); // Importar bcrypt
module.exports = router;