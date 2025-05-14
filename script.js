console.log('[SCRIPT.JS] Arquivo script.js INICIANDO INTERPRETAÇÃO.');

document.addEventListener('DOMContentLoaded', function () {
  console.log('[SCRIPT.JS] Evento DOMContentLoaded DISPARADO. Iniciando script principal.');
  // Elementos do DOM que o script principal interage
  const searchInput = document.getElementById('searchInput'); // Para filtros (se habilitado)
  const teamContainer = document.getElementById('team-container'); // Container principal dos cards de perfil
  const logoutButton = document.getElementById('logout-button');
  const closeModalBtn = document.getElementById('close-modal-btn'); // Botão "Fechar" no rodapé do modal de perfil

  // Elementos do modal de criação de usuário
  const showCreateUserModalBtn = document.getElementById('show-create-user-modal-btn');
  const createUserModal = document.getElementById('create-user-modal');
  const closeCreateUserModalBtn = document.getElementById('close-create-user-modal');
  const createUserForm = document.getElementById('create-user-form');
  const createUserMessage = document.getElementById('create-user-message');

  // Elementos do modal de edição de usuário
  const editUserModal = document.getElementById('edit-user-modal');
  const closeEditUserModalBtn = document.getElementById('close-edit-user-modal');
  const editUserForm = document.getElementById('edit-user-form');
  const editUserMessage = document.getElementById('edit-user-message');

  // Elementos do modal da tabela de competências
  const competenciesTableModal = document.getElementById('competencies-table-modal');
  const closeCompetenciesTableModalAction = document.getElementById('close-competencies-table-modal-action'); // Botão X no header do modal da tabela
  const closeCompetenciesTableModalBtn = document.getElementById('close-competencies-table-modal-btn'); // Botão "Fechar" no footer do modal da tabela

  let allTeamMembersGlobal = []; // Para armazenar os dados dos usuários
  let currentProfileInModalId = null; // Para saber qual perfil está no modal e permitir edições pelo admin
  let currentChartInstance = null; // Instância do gráfico de radar no modal
  let currentSkillsChartInstance = null; // Instância do gráfico de barras de skills no modal

  // Função para buscar todos os perfis da equipe (para o Admin)
  async function fetchAllTeamProfiles() {
    const token = localStorage.getItem('authToken');
    console.log('[fetchAllTeamProfiles] Called. Token:', token);
    if (!token) {
      window.location.href = 'login.html';
      return;
    }
    try {
      const response = await fetch('https://dev-team.onrender.com/api/team', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userName');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userId');
          window.location.href = 'login.html';
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const team = await response.json();
      console.log('[fetchAllTeamProfiles] Raw team data from API:', JSON.parse(JSON.stringify(team)));
      const loggedInUserId = localStorage.getItem('userId');
      console.log('[fetchAllTeamProfiles] loggedInUserId:', loggedInUserId);
      // Filtra o próprio admin da lista
      allTeamMembersGlobal = team.filter(member => member.id.toString() !== loggedInUserId);

      console.log('[fetchAllTeamProfiles] Filtered allTeamMembersGlobal (admin removed):', JSON.parse(JSON.stringify(allTeamMembersGlobal)));

      // Ordenar alfabeticamente por fullName (ou name como fallback)
      allTeamMembersGlobal.sort((a, b) => {
        const nameA = (a.fullName || a.name || '').toLowerCase();
        const nameB = (b.fullName || b.name || '').toLowerCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
      });

      displayTeamMembers(allTeamMembersGlobal); // Exibe todos inicialmente
      updateStats(allTeamMembersGlobal); // Atualiza as estatísticas
    } catch (error) {
      console.error("Failed to fetch team profiles:", error);
      if (teamContainer) {
        teamContainer.innerHTML = '<p class="text-red-500 text-center col-span-full">Erro ao carregar perfis da equipe.</p>';
      }
      updateStats([]);
    }
  }

  // Função para buscar o perfil do usuário logado (não admin)
  async function fetchMyProfile() {
    const token = localStorage.getItem('authToken');
    console.log('[fetchMyProfile] Called. Token:', token);
    if (!token) {
      window.location.href = 'login.html';
      return;
    }

    try {
      const response = await fetch('https://dev-team.onrender.com/api/users/me/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userName');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userId');
          window.location.href = 'login.html';
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const myProfile = await response.json();

      // Garante que todas as categorias de skills existam como arrays
      const skillCategories = ['backend', 'frontend', 'mobile', 'architecture', 'management', 'security', 'infra', 'data', 'immersive', 'marketing'];
      skillCategories.forEach(category => {
        myProfile[category] = myProfile[category] || [];
      });

      allTeamMembersGlobal = [myProfile]; // Armazena para consistência (embora só haja um)
      displayTeamMembers(myProfile);
      // updateStats([myProfile]); // Stats não são mostrados para usuário normal
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      if (teamContainer) {
        teamContainer.innerHTML = '<p class="text-red-500 text-center col-span-full">Erro ao carregar seu perfil. Tente fazer login novamente.</p>';
      }
      // updateStats([]); // Stats não são mostrados para usuário normal
    }
  }

  // Função para exibir os membros da equipe (cards)
  function displayTeamMembers(members) {
    if (!teamContainer) {
      console.error("Elemento 'team-container' não encontrado no DOM.");
      return;
    }
    console.log('[displayTeamMembers] Called with members:', JSON.parse(JSON.stringify(members)));
    teamContainer.innerHTML = '';

    const membersArray = Array.isArray(members) ? members : [members];

    if (!membersArray || membersArray.length === 0 || !membersArray[0]) {
      teamContainer.innerHTML = '<p class="text-gray-600 col-span-full text-center">Nenhum membro encontrado.</p>';
      if (isAdminUser()) updateStats([]);
      return;
    }

    console.log('[displayTeamMembers] isAdminUser() check in displayTeamMembers:', isAdminUser());
    if (!isAdminUser() && membersArray.length === 1) {
      teamContainer.className = 'grid grid-cols-1 gap-6';
    } else if (isAdminUser()) {
      teamContainer.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6';
    }

    membersArray.forEach(member => {
      const names = (member.name || "Usuário").split(' ');
      const initials = names.length > 1
        ? `${names[0][0]}${names[names.length - 1][0]}`
        : (names[0] ? names[0][0] : 'U');

      const totalSkills = [
        ...(member.backend || []),
        ...(member.frontend || []),
        ...(member.mobile || []),
        ...(member.architecture || []),
        ...(member.management || []),
        ...(member.security || []),
        ...(member.infra || []),
        ...(member.data || []),
        ...(member.immersive || []),
        ...(member.marketing || [])
      ].length;

      const allSkillObjectsForCard = [
        ...(member.backend || []).map(s => ({ ...s, category: 'backend' })),
        ...(member.frontend || []).map(s => ({ ...s, category: 'frontend' })),
        ...(member.mobile || []).map(s => ({ ...s, category: 'mobile' })),
        ...(member.architecture || []).map(s => ({ ...s, category: 'architecture' })),
        ...(member.management || []).map(s => ({ ...s, category: 'management' })),
        ...(member.security || []).map(s => ({ ...s, category: 'security' })),
        ...(member.infra || []).map(s => ({ ...s, category: 'infra' })),
        ...(member.data || []).map(s => ({ ...s, category: 'data' })),
        ...(member.immersive || []).map(s => ({ ...s, category: 'immersive' })),
        ...(member.marketing || []).map(s => ({ ...s, category: 'marketing' }))
      ];

      const card = document.createElement('div');
      let cardClasses = 'profile-card bg-white rounded-xl shadow-lg overflow-hidden animate-fade-in';
      if (!isAdminUser() && membersArray.length === 1) {
        cardClasses += ' max-w-2xl mx-auto';
      }
      card.className = cardClasses;
      card.innerHTML = `
                <div class="p-6">
                    <div class="flex items-center mb-4">
                        <div class="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg font-bold mr-3">
                            ${initials.toUpperCase()}
                        </div>
                        <div>
                            <h3 class="font-bold text-lg">${member.name}</h3>
                            <p class="text-sm text-gray-600">${member.fullName}</p>
                        </div>
                    </div>
                    <div class="mb-2">
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-sm font-medium text-gray-700">Habilidades</span>
                            <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">${totalSkills} competências</span>
                        </div>
                        <div class="text-xs text-gray-500 mb-2">
                            Email: ${member.username || 'N/A'} <br>
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
                                ${allSkillObjectsForCard.sort((a, b) => (b.skillLevel || 0) - (a.skillLevel || 0)).slice(0, 3).map(skillObj => `
                                    <span class="skill-chip text-xs bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
                                        ${skillObj.skillName} ${skillObj.skillLevel > 0 ? `(N${skillObj.skillLevel})` : ''}
                                    </span>
                                `).join('')}
                                ${totalSkills > 3 ? `<span class="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">+${totalSkills - 3}</span>` : ''}
                            </div>
                        </div>
                        ${isAdminUser() && member.id.toString() !== localStorage.getItem('userId') ? `
                        <div class="mt-4 pt-3 border-t border-gray-200 flex justify-end space-x-2">
                            <button class="edit-user-btn text-xs px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition" data-user-id="${member.id}">
                                <i class="fas fa-edit mr-1"></i>Editar
                            </button>
                            <button class="delete-user-btn text-xs px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition" data-user-id="${member.id}" data-user-name="${member.fullName}">
                                <i class="fas fa-trash-alt mr-1"></i>Excluir
                            </button>
                        </div>` : ''}
                    </div>
                </div>
            `;

      const viewProfileBtn = card.querySelector('.view-profile-btn');
      viewProfileBtn.addEventListener('click', () => openProfileModal(member));

      card.querySelector('.edit-user-btn')?.addEventListener('click', () => openEditUserModal(member));
      card.querySelector('.delete-user-btn')?.addEventListener('click', () => handleDeleteUser(member.id, member.fullName));

      teamContainer.appendChild(card);
    });
    if (isAdminUser()) updateStats(membersArray);
  }

  // Open profile modal
  function openProfileModal(member) {
    currentProfileInModalId = member.id; // Define o ID do usuário cujo perfil está no modal


    const names = (member.name || "Usuário").split(' ');
    const initials = names.length > 1
      ? `${names[0][0]}${names[names.length - 1][0]}`
      : (names[0] ? names[0][0] : 'U');

    const loggedInUserId = localStorage.getItem('userId');
    // Verifica se o usuário logado é o dono do perfil que está sendo visualizado
    const isOwnerOfProfile = loggedInUserId === currentProfileInModalId.toString();
    const isAdminViewingOtherProfile = isAdminUser() && !isOwnerOfProfile;

    document.getElementById('modal-name').textContent = member.name;
    document.getElementById('modal-fullname').textContent = member.fullName;
    document.getElementById('modal-initials').textContent = initials.toUpperCase();
    document.getElementById('modal-unit').textContent = member.unit || 'N/A';
    document.getElementById('modal-update').textContent = formatDateTime(member.lastUpdate);

    const topSkillsContainer = document.getElementById('modal-top-skills');
    topSkillsContainer.innerHTML = '';

    const allSkills = [
      ...(member.backend || []).map(s => ({ ...s, category: 'backend' })),
      ...(member.frontend || []).map(s => ({ ...s, category: 'frontend' })),
      ...(member.mobile || []).map(s => ({ ...s, category: 'mobile' })),
      ...(member.architecture || []).map(s => ({ ...s, category: 'architecture' })),
      ...(member.management || []).map(s => ({ ...s, category: 'management' })),
      ...(member.security || []).map(s => ({ ...s, category: 'security' })),
      ...(member.infra || []).map(s => ({ ...s, category: 'infra' })),
      ...(member.data || []).map(s => ({ ...s, category: 'data' })),
      ...(member.immersive || []).map(s => ({ ...s, category: 'immersive' })),
      ...(member.marketing || []).map(s => ({ ...s, category: 'marketing' }))
    ];

    const topRatedSkills = allSkills.sort((a, b) => (b.skillLevel || 0) - (a.skillLevel || 0)).slice(0, 5);

    if (topRatedSkills.length === 0) {
      topSkillsContainer.innerHTML = '<span class="text-xs text-gray-500 italic">Nenhuma habilidade principal avaliada.</span>';
    } else {
      topRatedSkills.forEach(skillObj => {
        const chip = document.createElement('span');
        chip.className = 'skill-chip text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full mb-1';
        chip.textContent = `${skillObj.skillName} (Nível ${skillObj.skillLevel || 'N/A'})`;
        topSkillsContainer.appendChild(chip);
      });
    }

    // Modificado para aceitar flags de permissão de edição
    function populateSkillsWithLevels(containerId, skillsArray, categoryKey, isAdminEditingOtherUser, isOwnerEditingOwnProfile) {
      const container = document.getElementById(containerId);
      container.innerHTML = '';
      const skills = skillsArray || [];
      skills.forEach(skillData => {
        const skillItemContainer = document.createElement('div');
        skillItemContainer.className = 'skill-level-item mb-3 p-3 border rounded-md bg-gray-50';

        const skillNameLabel = document.createElement('label');
        skillNameLabel.className = 'block text-sm font-medium text-gray-800 mb-1';
        skillNameLabel.textContent = skillData.skillName;

        const selectLevel = document.createElement('select');
        selectLevel.className = 'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm skill-level-select';
        selectLevel.dataset.skillName = skillData.skillName;
        selectLevel.dataset.categoryKey = categoryKey;

        // Lógica de habilitação do select:
        selectLevel.disabled = true; // Desabilitado por padrão
        if (isAdminEditingOtherUser) { // Admin editando perfil de outro usuário: pode editar qualquer nível
          selectLevel.disabled = false;
        } else if (isOwnerEditingOwnProfile) { // Dono do perfil editando o próprio
          if (skillData.skillLevel === 0 || typeof skillData.skillLevel === 'undefined') {
            selectLevel.disabled = false; // Só pode editar se nível for 0
          }
        }

        proficiencyLevels.forEach(profLevel => {
          const option = document.createElement('option');
          option.value = profLevel.level;
          option.textContent = profLevel.label;
          if (profLevel.level === (skillData.skillLevel || 0)) {
            option.selected = true;
          }
          selectLevel.appendChild(option);
        });

        const tooltipText = document.createElement('p');
        tooltipText.className = 'text-xs text-gray-600 mt-2 proficiency-tooltip bg-gray-100 p-2 rounded-md border border-gray-200'; // Estilizado e sempre visível

        function updateTooltip(level, skillNameForTooltip) {
          const selectedProficiency = proficiencyLevels.find(p => p.level === parseInt(level));
          let baseText = "Descrição não disponível.";
          if (selectedProficiency && selectedProficiency.text) {
            baseText = selectedProficiency.text;
          } else if (level === 0 && proficiencyLevels[0] && proficiencyLevels[0].text) {
            baseText = proficiencyLevels[0].text;
          }
          tooltipText.textContent = baseText.replace(/\{\{skillName\}\}/g, skillNameForTooltip);
        }
        selectLevel.addEventListener('change', (e) => updateTooltip(e.target.value, skillData.skillName));
        updateTooltip(selectLevel.value, skillData.skillName); // Chamada inicial para exibir a descrição do nível atual

        skillItemContainer.appendChild(skillNameLabel);
        skillItemContainer.appendChild(selectLevel);
        skillItemContainer.appendChild(tooltipText);
        container.appendChild(skillItemContainer);
      });
      if (skills.length === 0) {
        container.innerHTML = '<span class="text-xs text-gray-500 italic">Nenhuma habilidade registrada nesta categoria.</span>';
      }
    }

    const areaKeys = ['backend', 'frontend', 'mobile', 'architecture', 'management', 'security', 'infra', 'data', 'immersive', 'marketing'];
    const areaLabels = ['Backend', 'Frontend', 'Mobile', 'Arquitetura', 'Gestão', 'Segurança', 'Infra', 'Dados/IA', 'Imersivas', 'Marketing'];
    const skillCounts = areaKeys.map(key => {
      const skillsInCategory = member[key];
      if (!skillsInCategory || skillsInCategory.length === 0) return 0;
      const totalLevel = skillsInCategory.reduce((sum, s) => sum + (s.skillLevel || 0), 0);
      return skillsInCategory.length > 0 ? (totalLevel / skillsInCategory.length) : 0;
    });

    const ctx = document.getElementById('modal-chart').getContext('2d');
    if (currentChartInstance) {
      currentChartInstance.destroy();
    }
    currentChartInstance = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: areaLabels,
        datasets: [{
          label: 'Nível Médio por Área',
          data: skillCounts,
          fill: true,
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgb(59, 130, 246)',
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgb(59, 130, 246)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: { r: { angleLines: { display: true }, suggestedMin: 0, suggestedMax: 5, ticks: { stepSize: 1 } } },
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (context) { let label = context.dataset.label || ''; if (label) { label += ': '; } if (context.parsed.r !== null) { label += context.parsed.r.toFixed(2); } return label; } } } }
      }
    });

    populateSkillsWithLevels('modal-backend', member.backend, 'backend', isAdminViewingOtherProfile, isOwnerOfProfile);
    populateSkillsWithLevels('modal-frontend', member.frontend, 'frontend', isAdminViewingOtherProfile, isOwnerOfProfile);
    populateSkillsWithLevels('modal-mobile', member.mobile, 'mobile', isAdminViewingOtherProfile, isOwnerOfProfile);
    populateSkillsWithLevels('modal-architecture', member.architecture, 'architecture', isAdminViewingOtherProfile, isOwnerOfProfile);
    populateSkillsWithLevels('modal-management', member.management, 'management', isAdminViewingOtherProfile, isOwnerOfProfile);
    populateSkillsWithLevels('modal-security', member.security, 'security', isAdminViewingOtherProfile, isOwnerOfProfile);
    populateSkillsWithLevels('modal-infra', member.infra, 'infra', isAdminViewingOtherProfile, isOwnerOfProfile);
    populateSkillsWithLevels('modal-data', member.data, 'data', isAdminViewingOtherProfile, isOwnerOfProfile);
    populateSkillsWithLevels('modal-immersive', member.immersive, 'immersive', isAdminViewingOtherProfile, isOwnerOfProfile);
    populateSkillsWithLevels('modal-marketing', member.marketing, 'marketing', isAdminViewingOtherProfile, isOwnerOfProfile);

    const tabs = document.querySelectorAll('#competency-tabs button[role="tab"]');
    const tabContents = document.querySelectorAll('#competency-tab-content div[role="tabpanel"]');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => { t.setAttribute('aria-selected', 'false'); t.classList.remove('text-blue-600', 'border-blue-600'); t.classList.add('hover:text-gray-600', 'hover:border-gray-300', 'border-transparent'); });
        tabContents.forEach(content => { content.classList.add('hidden'); });
        tab.setAttribute('aria-selected', 'true');
        tab.classList.add('text-blue-600', 'border-blue-600');
        tab.classList.remove('hover:text-gray-600', 'hover:border-gray-300', 'border-transparent');
        const targetPanelId = tab.getAttribute('data-tabs-target');
        document.querySelector(targetPanelId).classList.remove('hidden');
      });
    });
    if (tabs.length > 0) { tabs[0].click(); }

    const allIndividualSkills = [];
    areaKeys.forEach(categoryKey => {
      if (member[categoryKey] && Array.isArray(member[categoryKey])) {
        member[categoryKey].forEach(skill => {
          if (skill.skillLevel > 0) {
            allIndividualSkills.push({
              name: skill.skillName,
              level: skill.skillLevel,
              levelText: proficiencyLevels.find(p => p.level === skill.skillLevel)?.label || ''
            });
          }
        });
      }
    });
    const topIndividualSkills = allIndividualSkills.sort((a, b) => b.level - a.level).slice(0, 10);
    const skillsChartCtx = document.getElementById('modal-skills-chart').getContext('2d');
    if (currentSkillsChartInstance) { currentSkillsChartInstance.destroy(); }
    if (topIndividualSkills.length > 0) {
      document.getElementById('modal-skills-chart').style.display = 'block';
      currentSkillsChartInstance = new Chart(skillsChartCtx, {
        type: 'bar',
        data: {
          labels: topIndividualSkills.map(s => s.name),
          datasets: [{
            label: 'Nível de Proficiência',
            data: topIndividualSkills.map(s => s.level),
            backgroundColor: proficiencyLevels.slice(1).map((p, index) => `hsl(${index * (360 / (proficiencyLevels.length - 1))}, 70%, 60%)`),
            borderColor: proficiencyLevels.slice(1).map((p, index) => `hsl(${index * (360 / (proficiencyLevels.length - 1))}, 70%, 50%)`),
            borderWidth: 1
          }]
        },
        options: {
          indexAxis: 'y', responsive: true, maintainAspectRatio: true,
          scales: { x: { beginAtZero: true, suggestedMax: 5, ticks: { stepSize: 1 } } },
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (context) { const skillIndex = context.dataIndex; return `${topIndividualSkills[skillIndex].name}: ${topIndividualSkills[skillIndex].levelText.replace(/^\d+\s*-\s*/, '')}`; } } } }
        }
      });
    } else {
      document.getElementById('modal-skills-chart').style.display = 'none';
    }

    const portfolioContainer = document.getElementById('modal-portfolio-competencies');
    portfolioContainer.innerHTML = '';
    const memberSkillsWithLevel = [];
    areaKeys.forEach(categoryKey => {
      if (member[categoryKey] && Array.isArray(member[categoryKey])) {
        member[categoryKey].forEach(skill => {
          if (skill.skillLevel > 0) { memberSkillsWithLevel.push(skill.skillName); }
        });
      }
    });
    let portfolioMatchesFound = 0;
    portfolioItemsMap.forEach(item => {
      const matchedSkills = item.relevantSkills.filter(rs => memberSkillsWithLevel.includes(rs));
      if (matchedSkills.length > 0) {
        portfolioMatchesFound++;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'p-3 border rounded-md bg-gray-50 shadow-sm';
        const itemName = document.createElement('h5');
        itemName.className = 'font-semibold text-gray-800 mb-1 text-sm flex items-center justify-between';

        if (item.link && item.link.trim() !== "") {
          // Tornar o nome do item um link
          const itemNameLink = document.createElement('a');
          itemNameLink.href = item.link;
          itemNameLink.target = '_blank';
          itemNameLink.rel = 'noopener noreferrer';
          itemNameLink.textContent = item.name;
          itemNameLink.className = 'hover:underline focus:outline-none focus:ring-2 focus:ring-blue-300 rounded'; // Adiciona underline no hover e estilo de foco
          itemName.appendChild(itemNameLink);

          // Ícone de link externo (continua como um link separado para manter o ícone)
          const linkIcon = document.createElement('a');
          linkIcon.href = item.link;
          linkIcon.target = '_blank';
          linkIcon.rel = 'noopener noreferrer';
          linkIcon.innerHTML = '<i class="fas fa-external-link-alt text-blue-500 hover:text-blue-700 ml-2 text-xs" title="Abrir anexo"></i>'; // ml-2 para espaço
          itemName.appendChild(linkIcon);
        } else {
          itemName.textContent = item.name; // Se não houver link, apenas o texto do nome
        }

        itemDiv.appendChild(itemName);
        const skillsList = document.createElement('div');
        skillsList.className = 'flex flex-wrap gap-1 mt-1';
        matchedSkills.forEach(ms => {
          const skillChip = document.createElement('span');
          skillChip.className = 'text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full';
          skillChip.textContent = ms;
          skillsList.appendChild(skillChip);
        });
        itemDiv.appendChild(skillsList);
        const coverage = (matchedSkills.length / item.relevantSkills.length) * 100;
        const coverageText = document.createElement('p');
        coverageText.className = 'text-xs text-gray-500 mt-1.5';
        coverageText.textContent = `Relevância: ${matchedSkills.length} de ${item.relevantSkills.length} habilidades mapeadas (${coverage.toFixed(0)}%).`;
        itemDiv.appendChild(coverageText);
        if (item.infrastructure && item.infrastructure.length > 0) {
          const infraTitle = document.createElement('h6');
          infraTitle.className = 'font-medium text-gray-700 mt-2 mb-1 text-xs';
          infraTitle.textContent = 'Infraestrutura Necessária:';
          itemDiv.appendChild(infraTitle);
          const infraList = document.createElement('div');
          infraList.className = 'flex flex-wrap gap-1';
          item.infrastructure.forEach(infraItem => {
            const infraChip = document.createElement('span');
            infraChip.className = 'text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full';
            infraChip.textContent = infraItem;
            infraList.appendChild(infraChip);
          });
          itemDiv.appendChild(infraList);
        }
        portfolioContainer.appendChild(itemDiv);
      }
    });
    if (portfolioMatchesFound === 0) {
      portfolioContainer.innerHTML = '<p class="text-sm text-gray-500 italic">Nenhuma competência deste perfil corresponde diretamente aos itens de portfólio definidos com as habilidades atuais (nível > 0).</p>';
    }

    const modalFooter = profileModal.querySelector('.border-t.p-4.flex.justify-end');
    let saveButton = modalFooter.querySelector('#save-skills-btn');
    const competencyTabsContainer = document.getElementById('competency-tabs');

    // Remover mensagem de submissão anterior, se houver
    const existingSubmittedMessage = competencyTabsContainer.previousElementSibling;
    if (existingSubmittedMessage && existingSubmittedMessage.classList.contains('skills-submitted-info')) {
      existingSubmittedMessage.remove();
    }

    // O botão de salvar aparece se o usuário logado for o dono do perfil OU se for admin editando outro perfil
    const canEffectivelyEditSkills = isOwnerOfProfile || isAdminViewingOtherProfile;
    if (canEffectivelyEditSkills) {
      if (!saveButton) {
        saveButton = document.createElement('button');
        saveButton.id = 'save-skills-btn';
        saveButton.className = 'px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition mr-2';
        saveButton.textContent = 'Salvar Habilidades';
        saveButton.addEventListener('click', saveSkills); // saveSkills usará currentProfileInModalId
        modalFooter.insertBefore(saveButton, modalFooter.firstChild);
      }
      saveButton.style.display = 'inline-block'; // Garante que está visível
    } else {
      if (saveButton) {
        saveButton.style.display = 'none'; // Esconde o botão se não for editável
      }
      // A mensagem de "skills já submetidas" foi removida, pois a lógica agora é por skill individual.
    }

    // Configurar botão para abrir o modal da tabela de competências
    const openCompetenciesTableViewBtn = document.getElementById('open-competencies-table-view-btn');
    if (openCompetenciesTableViewBtn) {
      // Remover listener antigo para evitar duplicação, clonando o botão
      const newBtn = openCompetenciesTableViewBtn.cloneNode(true);
      openCompetenciesTableViewBtn.parentNode.replaceChild(newBtn, openCompetenciesTableViewBtn);

      newBtn.addEventListener('click', () => {
        openCompetenciesTableModal(member);
      });
    } else {
      console.warn("Botão 'open-competencies-table-view-btn' não encontrado.");
    }


    profileModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }



  // Função para popular a tabela de competências detalhadas
  function populateCompetenciesTable(member, containerId) {
    const tableContainer = document.getElementById(containerId);
    tableContainer.innerHTML = ''; // Limpa conteúdo anterior

    const table = document.createElement('table');
    table.className = 'min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg shadow-sm';
    const thead = document.createElement('thead');
    thead.className = 'bg-gray-100';
    thead.innerHTML = `
      <tr>
        <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Categoria</th>
        <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Habilidade</th>
        <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Nível</th>
        <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Descrição Detalhada</th>
      </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    tbody.className = 'bg-white divide-y divide-gray-200';

    let evaluatedSkillsCount = 0;
    const areaKeys = ['backend', 'frontend', 'mobile', 'architecture', 'management', 'security', 'infra', 'data', 'immersive', 'marketing'];
    const categoryDisplayNames = { backend: 'Backend', frontend: 'Frontend', mobile: 'Mobile', architecture: 'Arquitetura', management: 'Gestão', security: 'Segurança', infra: 'Infra', data: 'Dados/IA', immersive: 'Imersivas', marketing: 'Marketing' };

    areaKeys.forEach(categoryKey => {
      if (member[categoryKey] && Array.isArray(member[categoryKey])) {
        member[categoryKey].forEach(skill => {
          if (skill.skillLevel > 0) { // Apenas habilidades avaliadas
            evaluatedSkillsCount++;
            const proficiency = proficiencyLevels.find(p => p.level === skill.skillLevel);
            const description = proficiency ? proficiency.text.replace(/\{\{skillName\}\}/g, skill.skillName) : 'N/A';
            const levelLabel = proficiency ? proficiency.label : 'N/A';

            const row = tbody.insertRow();
            row.className = 'hover:bg-gray-50 transition-colors duration-150';
            row.innerHTML = `
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">${categoryDisplayNames[categoryKey] || categoryKey}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">${skill.skillName}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">${levelLabel}</td>
              <td class="px-4 py-3 text-sm text-gray-600">${description}</td>
            `;
          }
        });
      }
    });

    table.appendChild(tbody);
    tableContainer.appendChild(table);

    if (evaluatedSkillsCount === 0) {
      tableContainer.innerHTML = '<p class="text-sm text-gray-500 italic p-4 text-center">Nenhuma competência avaliada (nível > 0) para exibir na tabela.</p>';
    }
  }

  // Função para abrir o modal da tabela de competências
  function openCompetenciesTableModal(member) {
    const competenciesTableModalTitle = document.getElementById('competencies-table-modal-title');
    if (competenciesTableModalTitle) {
      competenciesTableModalTitle.textContent = `Resumo Detalhado das Competências - ${member.fullName || member.name}`;
    }

    populateCompetenciesTable(member, 'competencies-table-modal-content');

    if (competenciesTableModal) {
      competenciesTableModal.classList.remove('hidden');
      // O profileModal permanece aberto por baixo, e o body.style.overflow já está 'hidden'
    } else {
      console.error("Elemento 'competencies-table-modal' não encontrado.");
    }
  }

  let isSavingSkills = false; // Flag para debounce

  // Função para salvar as habilidades
  async function saveSkills() {
    if (isSavingSkills) {
      console.log("SaveSkills: Já está salvando, ignorando chamada duplicada.");
      return;
    }
    isSavingSkills = true;
    console.log("SaveSkills: Iniciando salvamento...");

    const targetUserIdForSave = currentProfileInModalId; // Usa a variável de escopo mais amplo
    if (!targetUserIdForSave) {
      showToastNotification("ID do usuário alvo não encontrado para salvar.", 'error');
      isSavingSkills = false;
      return;
    }

    const updatedSkills = {};
    const skillSelects = profileModal.querySelectorAll('.skill-level-select');
    skillSelects.forEach(select => {
      const category = select.dataset.categoryKey;
      const skillName = select.dataset.skillName;
      const skillLevel = parseInt(select.value);

      if (!updatedSkills[category]) {
        updatedSkills[category] = [];
      }
      updatedSkills[category].push({ skillName, skillLevel });
    });

    // console.log("Enviando para o backend:", updatedSkills); // Log já extenso, pode ser comentado se o de cima for suficiente

    const token = localStorage.getItem('authToken');
    const loggedInUserId = localStorage.getItem('userId');
    const isAdminSaving = isAdminUser();
    const isEditingOwnProfile = loggedInUserId === targetUserIdForSave.toString();

    let endpoint = '';
    if (isAdminSaving && !isEditingOwnProfile) { // Admin editando outro usuário
      endpoint = `https://dev-team.onrender.com/api/users/${targetUserIdForSave}/skills`;
    } else if (isEditingOwnProfile) { // Usuário (admin ou não) editando o próprio perfil
      endpoint = 'https://dev-team.onrender.com/api/users/me/profile/skills';
    } else {
      showToastNotification("Não autorizado a salvar estas habilidades.", 'error');
      isSavingSkills = false;
      return;
    }

    try {
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ skills: updatedSkills })
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          // Tenta parsear a resposta como JSON, comum para erros de API bem formatados
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // Se response.json() falhar, o corpo da resposta pode não ser JSON (ex: erro 401/403 simples)
          // Tenta ler como texto para obter mais informações.
          const errorText = await response.text();
          if (errorText) {
            errorMessage += ` - ${errorText}`;
          }
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      showToastNotification(result.message || "Habilidades salvas com sucesso!", 'success');
      closeProfileModal();
      if (isAdminUser()) {
        fetchAllTeamProfiles(); // Admin recarrega a lista da equipe
      } else {
        fetchMyProfile(); // Usuário normal recarrega seu próprio perfil
      }
    } catch (error) {
      console.error("Erro detalhado ao salvar habilidades:", error);
      console.error("Mensagem do erro:", error.message);
      console.error("Stack do erro:", error.stack);
      showToastNotification(`Erro ao salvar habilidades: ${error.message}`, 'error');
    } finally {
      isSavingSkills = false; // Reseta a flag
    }
  }


  // Close profile modal
  function closeProfileModal() {
    profileModal.classList.add('hidden');
    // Destruir o gráfico ao fechar o modal
    if (currentChartInstance) {
      currentChartInstance.destroy();
      currentChartInstance = null;
    }
    if (currentSkillsChartInstance) { // Destruir o segundo gráfico também
      currentSkillsChartInstance.destroy();
      currentSkillsChartInstance = null;
    }
    currentProfileInModalId = null; // Resetar o ID ao fechar o modal
    document.body.style.overflow = 'auto';
  }

  // Filter team members (for Admin view)
  function filterTeamMembers() {
    if (!isAdminUser()) {
      // Para usuários normais, apenas exibe seu perfil (allTeamMembersGlobal terá 1 item)
      displayTeamMembers(allTeamMembersGlobal);
      return;
    }

    const searchTerm = searchInput ? searchInput.value.toLowerCase() : ""; // Verifica se searchInput existe
    // const selectedAreaDropdown = document.getElementById('filter-area').value; // Comentado, pois o filtro de área não está ativo
    const activeCategoryTab = document.querySelector('.category-tab.active');
    // const selectedCategoryTab = activeCategoryTab ? activeCategoryTab.dataset.category : 'all'; // Comentado, pois o filtro de categoria não está ativo para a busca por nome

    let filtered = [...allTeamMembersGlobal];

    // Filtrar por nome
    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchTerm) ||
        member.fullName.toLowerCase().includes(searchTerm)
      );
    }

    // Determinar a área/categoria final para filtrar (COMENTADO - FOCO NA BUSCA POR NOME)
    // let areaToFilterBy = 'all';
    // if (selectedAreaDropdown && selectedAreaDropdown.value !== 'all') { // Verifica se o elemento existe
    //     areaToFilterBy = selectedAreaDropdown.value;
    // } else if (activeCategoryTab && activeCategoryTab.dataset.category !== 'all') { // Verifica se o elemento existe
    //     areaToFilterBy = activeCategoryTab.dataset.category;
    // }

    // Filtrar por área/categoria se uma específica for selecionada (COMENTADO - FOCO NA BUSCA POR NOME)
    // if (areaToFilterBy !== 'all') {
    //     filtered = filtered.filter(member => {
    //         const skillsInCategory = member[areaToFilterBy]; // e.g., member.backend
    //         // Verifica se a categoria existe no membro e se tem skills nela
    //         return skillsInCategory && Array.isArray(skillsInCategory) && skillsInCategory.length > 0;
    //     });
    // }

    displayTeamMembers(filtered);
    updateStats(filtered); // Atualiza as estatísticas com base nos membros filtrados
  }

  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userId');
      window.location.href = 'login.html'; // Redireciona para a página de login
    });
  } else {
    console.warn("Botão de logout não encontrado.");
  }

  function checkLoginStatus() {
    const token = localStorage.getItem('authToken');
    const userName = localStorage.getItem('userName');
    console.log('[checkLoginStatus] Token:', token, 'UserName:', userName);

    if (token && userName) {
      userProfileSection.classList.remove('hidden');
      welcomeMessage.textContent = `Bem-vindo(a), ${userName}!`;


      const isAdmin = isAdminUser();
      console.log('[checkLoginStatus] isAdminUser() returned:', isAdmin);
      if (isAdmin) {
        console.log('[checkLoginStatus] Admin path taken.');
        if (showCreateUserModalBtn) {
          showCreateUserModalBtn.classList.remove('hidden');
        } else {
          console.warn('[checkLoginStatus] Admin user, but showCreateUserModalBtn not found.');
        }

        showCreateUserModalBtn.classList.remove('hidden');
        document.getElementById('filters-section').style.display = 'block';
        document.getElementById('categories-section').style.display = 'block';
        document.getElementById('stats-section').style.display = 'grid'; // 'grid' para manter o layout
        initializeFiltersAndCategories();
        fetchAllTeamProfiles();

      } else { // Não é admin
        console.log('[checkLoginStatus] Non-admin path taken.');
        document.getElementById('filters-section').style.display = 'none';

        if (showCreateUserModalBtn) showCreateUserModalBtn.classList.add('hidden');
        document.getElementById('categories-section').style.display = 'none';
        document.getElementById('stats-section').style.display = 'none';
        fetchMyProfile();
      }
    } else {
      console.log('[checkLoginStatus] No token or userName, redirecting to login.');
      window.location.href = 'login.html'; // Redireciona para login se não houver token
    }
  }

  function initializeFiltersAndCategories() {
    // searchInput já é uma variável global no escopo do script
    // const filterArea = document.getElementById('filter-area'); // Comentado
    // const resetFiltersBtn = document.getElementById('reset-filters'); // Comentado
    const categoryTabs = document.querySelectorAll('.category-tab');

    if (searchInput) { // Verifica se searchInput existe
      searchInput.addEventListener('input', filterTeamMembers);
    }
    // if (filterArea) filterArea.addEventListener('change', filterTeamMembers); // Comentado

    // Lógica do botão de reset comentada, pois o foco é na busca por nome
    // if (resetFiltersBtn) {
    //   resetFiltersBtn.addEventListener('click', () => {
    //     if (searchInput) searchInput.value = '';
    //     if (filterArea) filterArea.value = 'all';
    //     categoryTabs.forEach(tab => {
    //         tab.classList.remove('active');
    //         if (tab.dataset.category === 'all') {
    //           tab.classList.add('active');
    //         }
    //     });
    //     // Re-display all (filtered by admin's self-exclusion) members
    //     // allTeamMembersGlobal já está filtrado, então apenas chamamos filterTeamMembers para resetar
    //     filterTeamMembers();
    //   });
    // }

    categoryTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        categoryTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        filterTeamMembers(); // filterTeamMembers considerará a categoria ativa
      });
    });
  }

  // --- Create User Modal Logic ---
  if (showCreateUserModalBtn) {
    showCreateUserModalBtn.addEventListener('click', () => {
      createUserModal.classList.remove('hidden');
      createUserForm.reset();
      createUserMessage.textContent = '';
      createUserMessage.className = 'mt-3 text-sm text-center';
    });
  }

  if (closeCreateUserModalBtn) {
    closeCreateUserModalBtn.addEventListener('click', () => {
      createUserModal.classList.add('hidden');
    });
  }

  if (createUserForm) {
    createUserForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      createUserMessage.textContent = '';
      const submitButton = document.getElementById('create-user-submit-btn');
      submitButton.disabled = true;
      submitButton.textContent = 'Criando...';

      const fullName = document.getElementById('new-user-fullname').value;
      const email = document.getElementById('new-user-email').value;
      const unit = document.getElementById('new-user-unit').value;
      const name = fullName.split(' ')[0]; // Pega o primeiro nome
      const password = "password123"; // Senha padrão

      try {
        const response = await fetch('https://dev-team.onrender.com/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: email, password, name, fullName, unit })
        });
        const data = await response.json();

        if (response.ok) {
          showToastNotification(data.message || "Usuário criado com sucesso!", 'success');
          fetchAllTeamProfiles(); // Atualiza a lista de usuários no dashboard do admin
          setTimeout(() => {
            createUserModal.classList.add('hidden');
          }, 2000); // Fecha o modal após 2 segundos
        } else {
          showToastNotification(data.message || 'Falha ao criar usuário.', 'error');
        }
      } catch (error) {
        console.error('Create user error:', error);
        showToastNotification('Erro ao tentar criar usuário. Verifique a conexão.', 'error');
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Criar Usuário';
      }
    });
  }

  // --- Edit User Modal Logic ---
  function openEditUserModal(member) {
    editUserModal.classList.remove('hidden');
    editUserForm.reset();
    editUserMessage.textContent = '';
    editUserMessage.className = 'mt-3 text-sm text-center';

    document.getElementById('edit-user-id').value = member.id;
    document.getElementById('edit-user-fullname').value = member.fullName;
    document.getElementById('edit-user-email').value = member.username; // username é o email
    document.getElementById('edit-user-unit').value = member.unit || '';
  }

  if (closeEditUserModalBtn) {
    closeEditUserModalBtn.addEventListener('click', () => {
      editUserModal.classList.add('hidden');
    });
  }

  if (editUserForm) {
    editUserForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      editUserMessage.textContent = '';
      const submitButton = document.getElementById('edit-user-submit-btn');
      submitButton.disabled = true;
      submitButton.textContent = 'Salvando...';

      const userId = document.getElementById('edit-user-id').value;
      const fullName = document.getElementById('edit-user-fullname').value;
      const email = document.getElementById('edit-user-email').value;
      const unit = document.getElementById('edit-user-unit').value;
      const token = localStorage.getItem('authToken');

      try {
        const response = await fetch(`https://dev-team.onrender.com/api/users/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ fullName, email, unit })
        });
        const data = await response.json();

        if (response.ok) {
          showToastNotification(data.message || "Usuário atualizado com sucesso!", 'success');
          fetchAllTeamProfiles(); // Atualiza a lista
          setTimeout(() => {
            editUserModal.classList.add('hidden');
          }, 2000);
        } else {
          showToastNotification(data.message || 'Falha ao atualizar usuário.', 'error');
        }
      } catch (error) {
        console.error('Edit user error:', error);
        showToastNotification('Erro ao tentar atualizar usuário.', 'error');
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Salvar Alterações';
      }
    });
  }

  // --- Delete User Logic ---
  async function handleDeleteUser(userId, userName) {
    if (confirm(`Tem certeza que deseja excluir o usuário "${userName}" (ID: ${userId})? Esta ação não pode ser desfeita.`)) {
      const token = localStorage.getItem('authToken');
      try {
        const response = await fetch(`https://dev-team.onrender.com/api/users/${userId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        showToastNotification(data.message || (response.ok ? "Usuário excluído com sucesso." : "Falha ao excluir usuário."), response.ok ? 'success' : 'error');
        if (response.ok) fetchAllTeamProfiles(); // Atualiza a lista
      } catch (error) {
        console.error('Delete user error:', error);
        showToastNotification('Erro ao tentar excluir usuário.', 'error');
      }
    }
  }

  // Event listeners
  // closeModal é uma variável global definida no index.html (botão X no topo do modal de perfil)
  if (closeModal) { // closeModal é o ID do botão X no modal de perfil
    closeModal.addEventListener('click', closeProfileModal);
  } else {
    console.warn("Elemento 'close-modal' (botão X do modal de perfil) não encontrado.");
  }
  if (closeModalBtn) { // closeModalBtn é o botão "Fechar" no rodapé do modal de perfil
    closeModalBtn.addEventListener('click', closeProfileModal);
  }

  // Event listeners para o novo modal da tabela de competências
  if (closeCompetenciesTableModalAction) {
    closeCompetenciesTableModalAction.addEventListener('click', () => {
      if (competenciesTableModal) competenciesTableModal.classList.add('hidden');
    });
  } else {
    console.warn("Elemento 'close-competencies-table-modal-action' não encontrado.");
  }
  if (closeCompetenciesTableModalBtn) {
    closeCompetenciesTableModalBtn.addEventListener('click', () => {
      if (competenciesTableModal) competenciesTableModal.classList.add('hidden');
    });
  }

  // Initialize on page load
  checkLoginStatus();
})