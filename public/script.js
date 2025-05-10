// script.js

document.addEventListener('DOMContentLoaded', function () {
  // Base URL para todas as chamadas à API (serverless na Vercel)
  const API_BASE = '/api';

  // Elementos do DOM
  const searchInput = document.getElementById('searchInput');
  const teamContainer = document.getElementById('team-container');
  const logoutButton = document.getElementById('logout-button');
  const closeModalBtn = document.getElementById('close-modal-btn');

  const showCreateUserModalBtn = document.getElementById('show-create-user-modal-btn');
  const createUserModal = document.getElementById('create-user-modal');
  const closeCreateUserModalBtn = document.getElementById('close-create-user-modal');
  const createUserForm = document.getElementById('create-user-form');
  const createUserMessage = document.getElementById('create-user-message');

  const editUserModal = document.getElementById('edit-user-modal');
  const closeEditUserModalBtn = document.getElementById('close-edit-user-modal');
  const editUserForm = document.getElementById('edit-user-form');
  const editUserMessage = document.getElementById('edit-user-message');

  let allTeamMembersGlobal = [];
  let currentChartInstance = null;
  let currentSkillsChartInstance = null;

  // Busca todos os perfis da equipe (admin)
  async function fetchAllTeamProfiles() {
    const token = localStorage.getItem('authToken');
    if (!token) return window.location.href = 'login.html';

    try {
      const res = await fetch(`${API_BASE}/team`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          logoutAndRedirect();
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const team = await res.json();
      const loggedInUserId = localStorage.getItem('userId');
      allTeamMembersGlobal = team.filter(m => m.id.toString() !== loggedInUserId);
      allTeamMembersGlobal.sort((a, b) => {
        const na = (a.fullName || a.name || '').toLowerCase();
        const nb = (b.fullName || b.name || '').toLowerCase();
        return na < nb ? -1 : na > nb ? 1 : 0;
      });

      displayTeamMembers(allTeamMembersGlobal);
      updateStats(allTeamMembersGlobal);
    } catch (err) {
      console.error("Failed to fetch team profiles:", err);
      if (teamContainer) {
        teamContainer.innerHTML = '<p class="text-red-500 text-center col-span-full">Erro ao carregar perfis da equipe.</p>';
      }
      updateStats([]);
    }
  }

  // Busca perfil do usuário logado (não admin)
  async function fetchMyProfile() {
    const token = localStorage.getItem('authToken');
    if (!token) return window.location.href = 'login.html';

    try {
      const res = await fetch(`${API_BASE}/users/me/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          logoutAndRedirect();
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const myProfile = await res.json();
      const skillCats = ['backend', 'frontend', 'mobile', 'architecture', 'management', 'security', 'infra', 'data', 'immersive', 'marketing'];
      skillCats.forEach(cat => { myProfile[cat] = myProfile[cat] || []; });
      allTeamMembersGlobal = [myProfile];
      displayTeamMembers(myProfile);
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      if (teamContainer) {
        teamContainer.innerHTML = '<p class="text-red-500 text-center col-span-full">Erro ao carregar seu perfil.</p>';
      }
    }
  }

  function logoutAndRedirect() {
    localStorage.clear();
    return window.location.href = 'login.html';
  }

  // Exibe cards de perfil
  function displayTeamMembers(members) {
    if (!teamContainer) return;
    teamContainer.innerHTML = '';
    const arr = Array.isArray(members) ? members : [members];
    if (arr.length === 0 || !arr[0]) {
      teamContainer.innerHTML = '<p class="text-gray-600 col-span-full text-center">Nenhum membro encontrado.</p>';
      if (isAdminUser()) updateStats([]);
      return;
    }

    teamContainer.className = isAdminUser()
      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6'
      : (arr.length === 1 ? 'grid grid-cols-1 gap-6' : '');

    arr.forEach(member => {
      const names = (member.name || '').split(' ');
      const initials = names.length > 1
        ? `${names[0][0]}${names[names.length - 1][0]}`
        : (names[0] ? names[0][0] : 'U');
      const totalSkills = ['backend', 'frontend', 'mobile', 'architecture', 'management', 'security', 'infra', 'data', 'immersive', 'marketing']
        .reduce((sum, cat) => sum + ((member[cat] || []).length), 0);

      const topSkills = []
        .concat(...['backend', 'frontend', 'mobile', 'architecture', 'management', 'security', 'infra', 'data', 'immersive', 'marketing']
          .map(cat => (member[cat] || []).map(s => ({ ...s, category: cat }))))
        .sort((a, b) => (b.skillLevel || 0) - (a.skillLevel || 0))
        .slice(0, 3);

      const moreCount = totalSkills - topSkills.length;

      const card = document.createElement('div');
      card.className = 'profile-card bg-white rounded-xl shadow-lg overflow-hidden animate-fade-in';
      if (!isAdminUser() && arr.length === 1) card.classList.add('max-w-2xl', 'mx-auto');
      card.innerHTML = `
        <div class="p-6">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg font-bold mr-3">
              ${initials.toUpperCase()}
            </div>
            <div>
              <h3 class="font-bold text-lg">${member.name}</h3>
              <p class="text-sm text-gray-600">${member.fullName || ''}</p>
            </div>
          </div>
          <div class="mb-2">
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm font-medium text-gray-700">Habilidades</span>
              <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                ${totalSkills} competências
              </span>
            </div>
            <div class="text-xs text-gray-500 mb-2">
              Email: ${member.username || 'N/A'}<br>
              Unidade: ${member.unit || 'N/A'}
            </div>
            <div class="flex justify-between items-center text-sm mb-3">
              <span class="text-gray-500">Última atualização: ${formatDateTime(member.lastUpdate)}</span>
              <button class="view-profile-btn px-3 py-1 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 transition">
                Ver Perfil Completo
              </button>
            </div>
            <div class="mb-4">
              <h6 class="text-xs font-medium text-gray-600 mb-1">Principais Habilidades:</h6>
              <div class="flex flex-wrap gap-2">
                ${topSkills.map(s => `
                  <span class="skill-chip text-xs bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
                    ${s.skillName}${s.skillLevel > 0 ? ` (N${s.skillLevel})` : ``}
                  </span>`).join('')}
                ${moreCount > 0 ? `<span class="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                  +${moreCount}
                </span>`: ``}
              </div>
            </div>
            ${isAdminUser() && member.username !== 'admin@example.com' ? `
            <div class="mt-4 pt-3 border-t border-gray-200 flex justify-end space-x-2">
              <button class="edit-user-btn text-xs px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition" data-user-id="${member.id}">
                <i class="fas fa-edit mr-1"></i>Editar
              </button>
              <button class="delete-user-btn text-xs px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition" data-user-id="${member.id}" data-user-name="${member.fullName}">
                <i class="fas fa-trash-alt mr-1"></i>Excluir
              </button>
            </div>
            `: ``}
          </div>
        </div>`;

      card.querySelector('.view-profile-btn').addEventListener('click', () => openProfileModal(member));
      card.querySelector('.edit-user-btn')?.addEventListener('click', () => openEditUserModal(member));
      card.querySelector('.delete-user-btn')?.addEventListener('click', () => handleDeleteUser(member.id, member.fullName));

      teamContainer.appendChild(card);
    });

    if (isAdminUser()) updateStats(arr);
  }

  // ... Demais funções (openProfileModal, formatDateTime, updateStats, etc.) ficam iguais ...

  // Salvar habilidades (PUT)
  async function saveSkills() {
    if (isSavingSkills) return;
    isSavingSkills = true;

    const updatedSkills = {};
    profileModal.querySelectorAll('.skill-level-select').forEach(sel => {
      const cat = sel.dataset.categoryKey;
      const name = sel.dataset.skillName;
      const lvl = parseInt(sel.value);
      if (!updatedSkills[cat]) updatedSkills[cat] = [];
      updatedSkills[cat].push({ skillName: name, skillLevel: lvl });
    });

    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch(`${API_BASE}/users/me/profile/skills`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ skills: updatedSkills })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `HTTP ${res.status}`);
      }
      const result = await res.json();
      showToastNotification(result.message || "Habilidades salvas!", 'success');
      closeProfileModal();
      isAdminUser() ? fetchAllTeamProfiles() : fetchMyProfile();
    } catch (e) {
      console.error("Erro ao salvar skills:", e);
      showToastNotification(`Erro: ${e.message}`, 'error');
    } finally {
      isSavingSkills = false;
    }
  }

  // Create user (POST)
  createUserForm?.addEventListener('submit', async e => {
    e.preventDefault();
    createUserMessage.textContent = '';
    const btn = document.getElementById('create-user-submit-btn');
    btn.disabled = true;
    btn.textContent = 'Criando...';

    const fullName = document.getElementById('new-user-fullname').value;
    const email = document.getElementById('new-user-email').value;
    const unit = document.getElementById('new-user-unit').value;
    const name = fullName.split(' ')[0];
    const password = 'password123';
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password, name, fullName, unit })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
      showToastNotification(data.message || "Criado!", 'success');
      fetchAllTeamProfiles();
      setTimeout(() => createUserModal.classList.add('hidden'), 2000);
    } catch (err) {
      console.error('Create user error:', err);
      showToastNotification(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Criar Usuário';
    }
  });

  // Edit user (PUT)
  editUserForm?.addEventListener('submit', async e => {
    e.preventDefault();
    editUserMessage.textContent = '';
    const btn = document.getElementById('edit-user-submit-btn');
    btn.disabled = true;
    btn.textContent = 'Salvando...';

    const userId = document.getElementById('edit-user-id').value;
    const fullName = document.getElementById('edit-user-fullname').value;
    const email = document.getElementById('edit-user-email').value;
    const unit = document.getElementById('edit-user-unit').value;
    const token = localStorage.getItem('authToken');

    try {
      const res = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ fullName, email, unit })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
      showToastNotification(data.message || "Atualizado!", 'success');
      fetchAllTeamProfiles();
      setTimeout(() => editUserModal.classList.add('hidden'), 2000);
    } catch (err) {
      console.error('Edit user error:', err);
      showToastNotification(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Salvar Alterações';
    }
  });

  // Delete user (DELETE)
  async function handleDeleteUser(userId, userName) {
    if (!confirm(`Excluir "${userName}"?`)) return;
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      showToastNotification(data.message || `HTTP ${res.status}`, res.ok ? 'success' : 'error');
      if (res.ok) fetchAllTeamProfiles();
    } catch (err) {
      console.error('Delete user error:', err);
      showToastNotification(err.message, 'error');
    }
  }

  // Logout
  logoutButton?.addEventListener('click', () => logoutAndRedirect());

  // Inicialização
  checkLoginStatus();

  function checkLoginStatus() {
    const token = localStorage.getItem('authToken');
    const userName = localStorage.getItem('userName');
    if (!token || !userName) return window.location.href = 'login.html';

    if (isAdminUser()) {
      showCreateUserModalBtn?.classList.remove('hidden');
      document.getElementById('filters-section').style.display = 'block';
      document.getElementById('categories-section').style.display = 'block';
      document.getElementById('stats-section').style.display = 'grid';
      initializeFiltersAndCategories();
      fetchAllTeamProfiles();
    } else {
      showCreateUserModalBtn?.classList.add('hidden');
      document.getElementById('filters-section').style.display = 'none';
      document.getElementById('categories-section').style.display = 'none';
      document.getElementById('stats-section').style.display = 'none';
      fetchMyProfile();
    }
  }

  // Helpers: isAdminUser, formatDateTime, updateStats, initializeFiltersAndCategories, openProfileModal, closeProfileModal, showToastNotification, proficiencyLevels, portfolioItemsMap...
  // (mantenha suas implementações originais para essas funções/utilitários)
});
