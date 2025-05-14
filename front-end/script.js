document.addEventListener('DOMContentLoaded', function () {
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

  let allTeamMembersGlobal = []; // Para armazenar os dados dos usuários
  let currentChartInstance = null; // Instância do gráfico de radar no modal
  let currentSkillsChartInstance = null; // Instância do gráfico de barras de skills no modal

  // Função para buscar todos os perfis da equipe (para o Admin)
  async function fetchAllTeamProfiles() {
    const token = localStorage.getItem('authToken');
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
      const loggedInUserId = localStorage.getItem('userId');
      // Filtra o próprio admin da lista
      allTeamMembersGlobal = team.filter(member => member.id.toString() !== loggedInUserId);

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
    teamContainer.innerHTML = '';

    const membersArray = Array.isArray(members) ? members : [members];

    if (!membersArray || membersArray.length === 0 || !membersArray[0]) {
      teamContainer.innerHTML = '<p class="text-gray-600 col-span-full text-center">Nenhum membro encontrado.</p>';
      if (isAdminUser()) updateStats([]);
      return;
    }

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
                        ${isAdminUser() && member.username !== 'admin@sp.senai.br' ? `
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
    const names = (member.name || "Usuário").split(' ');
    const initials = names.length > 1
      ? `${names[0][0]}${names[names.length - 1][0]}`
      : (names[0] ? names[0][0] : 'U');

    const loggedInUserId = localStorage.getItem('userId');
    // Verifica se o usuário logado é o dono do perfil que está sendo visualizado
    const isOwnerOfProfile = loggedInUserId === member.id.toString();

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

    function populateSkillsWithLevels(containerId, skillsArray, categoryKey, isOwnerViewingOwnProfile) {
      const container = document.getElementById(containerId);
      container.innerHTML = '';
      const skills = skillsArray || [];
      skills.forEach(skillData => {
        const skillItemContainer = document.createElement('div');
        // A skill é editável SE:
        // 1. O usuário logado é o dono do perfil E
        // 2. A skill ainda não foi avaliada (skillLevel é 0 ou undefined)
        const isThisSkillEditable = isOwnerViewingOwnProfile && (skillData.skillLevel === 0 || typeof skillData.skillLevel === 'undefined');
        skillItemContainer.className = 'skill-level-item mb-3 p-3 border rounded-md bg-gray-50';
        const skillNameLabel = document.createElement('label');
        skillNameLabel.className = 'block text-sm font-medium text-gray-800 mb-1';
        skillNameLabel.textContent = skillData.skillName;
        const selectLevel = document.createElement('select');
        selectLevel.className = 'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm skill-level-select';
        selectLevel.dataset.skillName = skillData.skillName;
        selectLevel.dataset.categoryKey = categoryKey;
        selectLevel.disabled = !isThisSkillEditable; // Desabilita se não for editável
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
        tooltipText.className = 'text-xs text-gray-500 mt-1 italic hidden proficiency-tooltip';
        function updateTooltip(level) {
          const selectedProficiency = proficiencyLevels.find(p => p.level === parseInt(level));
          const defaultTooltipText = proficiencyLevels[0]?.text || "Descrição não disponível.";
          tooltipText.textContent = selectedProficiency ? (selectedProficiency.text || defaultTooltipText) : defaultTooltipText;
          tooltipText.classList.remove('hidden');
        }
        selectLevel.addEventListener('change', (e) => updateTooltip(e.target.value));
        updateTooltip(selectLevel.value);
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

    populateSkillsWithLevels('modal-backend', member.backend, 'backend', isOwnerOfProfile);
    populateSkillsWithLevels('modal-frontend', member.frontend, 'frontend', isOwnerOfProfile);
    populateSkillsWithLevels('modal-mobile', member.mobile, 'mobile', isOwnerOfProfile);
    populateSkillsWithLevels('modal-architecture', member.architecture, 'architecture', isOwnerOfProfile);
    populateSkillsWithLevels('modal-management', member.management, 'management', isOwnerOfProfile);
    populateSkillsWithLevels('modal-security', member.security, 'security', isOwnerOfProfile);
    populateSkillsWithLevels('modal-infra', member.infra, 'infra', isOwnerOfProfile);
    populateSkillsWithLevels('modal-data', member.data, 'data', isOwnerOfProfile);
    populateSkillsWithLevels('modal-immersive', member.immersive, 'immersive', isOwnerOfProfile);
    populateSkillsWithLevels('modal-marketing', member.marketing, 'marketing', isOwnerOfProfile);

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

    // O botão de salvar aparece se o usuário logado for o dono do perfil
    if (isOwnerOfProfile) {
      if (!saveButton) {
        saveButton = document.createElement('button');
        saveButton.id = 'save-skills-btn';
        saveButton.className = 'px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition mr-2';
        saveButton.textContent = 'Salvar Habilidades';
        saveButton.addEventListener('click', saveSkills);
        modalFooter.insertBefore(saveButton, modalFooter.firstChild);
      }
      saveButton.style.display = 'inline-block'; // Garante que está visível
    } else {
      if (saveButton) {
        saveButton.style.display = 'none'; // Esconde o botão se não for editável
      }
      // A mensagem de "skills já submetidas" foi removida, pois a lógica agora é por skill individual.
    }
    profileModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
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
    try {
      const response = await fetch('https://dev-team.onrender.com/api/users/me/profile/skills', {
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

    if (token && userName) {
      userProfileSection.classList.remove('hidden');
      welcomeMessage.textContent = `Bem-vindo(a), ${userName}!`;

      if (isAdminUser() && showCreateUserModalBtn) { // Adicionada verificação para showCreateUserModalBtn
        showCreateUserModalBtn.classList.remove('hidden');
        document.getElementById('filters-section').style.display = 'block';
        document.getElementById('categories-section').style.display = 'block';
        document.getElementById('stats-section').style.display = 'grid'; // 'grid' para manter o layout
        initializeFiltersAndCategories();
        fetchAllTeamProfiles();
      } else if (!isAdminUser()) { // Garante que o botão de criar usuário seja escondido se não for admin
        document.getElementById('filters-section').style.display = 'none';
        showCreateUserModalBtn.classList.add('hidden');
        document.getElementById('categories-section').style.display = 'none';
        document.getElementById('stats-section').style.display = 'none';
        fetchMyProfile();
      }
    } else {
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

  // Initialize on page load
  checkLoginStatus();
})