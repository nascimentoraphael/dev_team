console.log('[SCRIPT.JS] Arquivo script.js INICIANDO INTERPRETAÇÃO.');

document.addEventListener('DOMContentLoaded', function () {
  console.log('[SCRIPT.JS] Evento DOMContentLoaded DISPARADO. Iniciando script principal.');
  // Elementos do DOM que o script principal interage
  const searchInput = document.getElementById('searchInput');
  const teamContainer = document.getElementById('team-container');
  const logoutButton = document.getElementById('logout-button');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const profileModal = document.getElementById('profile-modal');
  const userProfileSection = document.getElementById('user-profile-section');
  const welcomeMessage = document.getElementById('welcome-message');

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
  const closeCompetenciesTableModalAction = document.getElementById('close-competencies-table-modal-action');
  const closeCompetenciesTableModalBtn = document.getElementById('close-competencies-table-modal-btn');

  // Elementos do modal de alteração de senha
  const showChangePasswordModalBtn = document.getElementById('show-change-password-modal-btn');
  const changePasswordModal = document.getElementById('change-password-modal');
  const closeChangePasswordModalBtn = document.getElementById('close-change-password-modal');
  const changePasswordForm = document.getElementById('change-password-form');
  const changePasswordMessage = document.getElementById('change-password-message');

  let allTeamMembersGlobal = [];
  let currentProfileInModalId = null;
  let currentChartInstance = null;
  let currentSkillsChartInstance = null;

  // ---------------------------------------------------------------------------
  // FUNÇÕES AUXILIARES GLOBAIS (dentro do DOMContentLoaded)
  // ---------------------------------------------------------------------------

  function formatDateTime(isoString) {
    if (!isoString) return 'N/A';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) {
        return 'Data inválida';
      }
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
      });
    } catch (e) {
      console.error("Erro ao formatar data:", isoString, e);
      return 'Erro na data';
    }
  }

  const proficiencyLevels = [

    {
      level: 0,
      label: "0 - Não Avaliado / Sem Experiência",
      text: "Nenhuma avaliação ou experiência prática registrada para {{skillName}}."
    },
    {
      level: 1,
      label: "1 - Familiar (Conceitos Básicos)",
      text: "Familiarizado com os conceitos básicos de {{skillName}}, como seus princípios fundamentais e aplicações comuns, mas ainda não aplicou esses conhecimentos em projetos reais."
    },
    {
      level: 2,
      label: "2 - Iniciante (Entende Terminologia)",
      text: "Entende e consegue discutir a terminologia e os conceitos fundamentais de {{skillName}}, como seus componentes chave e casos de uso. Pode participar de discussões sobre projetos e contribuir com ideias básicas relacionadas a {{skillName}}."
    },
    {
      level: 3,
      label: "3 - Intermediário (Aplica com Orientação)",
      text: "Capaz de aplicar as habilidades de {{skillName}} de forma independente em situações familiares, como a implementação de funcionalidades padrão ou a resolução de problemas comuns. Pode preparar o ambiente, desenvolver soluções e avaliar resultados com orientação ocasional para {{skillName}}."
    },
    {
      level: 4,
      label: "4 - Avançado (Orienta Outros)",
      text: "Pode orientar ou guiar outros na aplicação de {{skillName}}, incluindo a explicação de nuances complexas, melhores práticas e otimizações. Tem experiência em liderar aspectos técnicos de projetos envolvendo {{skillName}} e garantir que os objetivos sejam alcançados dentro do prazo e do orçamento."
    },
    {
      level: 5,
      label: "5 - Especialista (Gerencia Projetos Complexos)",
      text: "Demonstrou resultados consistentes na aplicação de {{skillName}} em diversos contextos e desafios. Capaz de gerenciar projetos complexos e de grande escala, implementar metodologias avançadas com {{skillName}} e inovar na abordagem para resolver problemas. Seus resultados são mensuráveis e alinhados com as necessidades e objetivos departamentais."
    }
  ];

  const portfolioItemsMap = [
    {
      name: "Análise de Vulnerabilidades",
      link: "https://sesisenaisp.sharepoint.com/:p:/r/sites/PPO-ComitdeTIeCybersegurana/Documentos%20Compartilhados/Comit%C3%AA%20de%20TI,%20IA%20e%20Cyberseguran%C3%A7a/Portf%C3%B3lio%20SENAI-SP/Product%20Lean%20Canvas%20-%20SGSET/An%C3%A1lise%20de%20Vulnerabilidades.pptx?d=wf00cfba39cb342c8b6ddf19595f055d5&csf=1&web=1&e=AY6zt6",
      relevantSkills: ["Pentest", "Kali Linux", "OWASP ZAP", "Segurança em Redes", "Análise de Risco", "Hardening", "Criptografia"],
      infrastructure: ["Toolkit para Analise de Vulnerabilidade (open-source, gratuito)", "Notebook gamer de alto desempenho"]
    },
    {
      name: "Assessment do CIS Controlvs V8",
      link: "https://sesisenaisp.sharepoint.com/:p:/r/sites/PPO-ComitdeTIeCybersegurana/Documentos%20Compartilhados/Comit%C3%AA%20de%20TI,%20IA%20e%20Cyberseguran%C3%A7a/Portf%C3%B3lio%20SENAI-SP/Product%20Lean%20Canvas%20-%20SGSET/Assessment%20CIS%20Controls%20v8.pptx?d=wf1a0f84445574bafa59b9ddbae3b0d14&csf=1&web=1&e=Uu4s2q",
      relevantSkills: ["ISO 27001", "Governança", "Compliance Geral", "Análise de Risco", "Adequação LGPD"],
      infrastructure: ["Notebook gamer de alto desempenho"]
    },
    {
      name: "Assessment do CIS Controls V9",
      link: "",
      relevantSkills: ["ISO 27001", "ISO 27005 (Gestão de Riscos)", "Governança", "Compliance Geral", "Análise de Risco", "Adequação LGPD"],
      infrastructure: ["Notebook gamer de alto desempenho", "Acesso digital a normas ABNT e ISO"]
    },
    {
      name: "Assessoria em implantação de projetos de Infraestrutura de TI na Indústria",
      link: "https://sesisenaisp.sharepoint.com/:p:/r/sites/PPO-ComitdeTIeCybersegurana/Documentos%20Compartilhados/Comit%C3%AA%20de%20TI,%20IA%20e%20Cyberseguran%C3%A7a/Portf%C3%B3lio%20SENAI-SP/Product%20Lean%20Canvas%20-%20SGSET/Assessoria%20em%20implanta%C3%A7%C3%A3o%20de%20projetos%20de%20Infra%20TI%20na%20ind%C3%BAstria.pptx?d=w7a7e44fd00bf4574be08db0561b6a8f9&csf=1&web=1&e=klQ2wF",
      relevantSkills: ["Amazon Web Services", "Azure", "Google Cloud Platform", "Docker", "Kubernetes", "Servidores Linux", "Servidores Windows", "Configurações de Rede", "Terraform", "DevOps", "Scrum", "Kanban", "ISA 62.443 (IEC 62443)"],
      infrastructure: ["Notebook gamer de alto desempenho", "Raspberry PI 5+", "Servidores locais ou híbridos", "Roteadores industriais, switches gerenciáveis"]
    },
    {
      name: "Assessoria em implantação de suíte de serviços em nuvem na indústria",
      link: "https://sesisenaisp.sharepoint.com/:p:/r/sites/PPO-ComitdeTIeCybersegurana/Documentos%20Compartilhados/Comit%C3%AA%20de%20TI,%20IA%20e%20Cyberseguran%C3%A7a/Portf%C3%B3lio%20SENAI-SP/Product%20Lean%20Canvas%20-%20SGSET/Assessoria%20em%20implanta%C3%A7%C3%A3o%20de%20su%C3%ADte%20de%20servi%C3%A7os%20em%20nuvem%20na%20ind%C3%BAstria.pptx?d=w94835bab29bd4d209d8584e719c2a9d2&csf=1&web=1&e=bMteeM",
      relevantSkills: ["Amazon Web Services", "Azure", "Google Cloud Platform", "Computação em Nuvem", "Scrum", "Kanban"],
      infrastructure: ["Notebook gamer de alto desempenho", "Assinatura Microsoft Azure", "Assinatura AWS", "Assinatura Google Cloud Platform"]
    },
    {
      name: "Avaliação de Maturidade e conformidade em SI",
      link: "https://sesisenaisp.sharepoint.com/:p:/r/sites/PPO-ComitdeTIeCybersegurana/Documentos%20Compartilhados/Comit%C3%AA%20de%20TI,%20IA%20e%20Cyberseguran%C3%A7a/Portf%C3%B3lio%20SENAI-SP/Product%20Lean%20Canvas%20-%20SGSET/Avalia%C3%A7%C3%A3o%20de%20Maturidade%20e%20Conformidade%20em%20SI%20e%20Privacidade.pptx?d=w860a30ac60c0463097103461cd7fcbd9&csf=1&web=1&e=cljWMg",
      relevantSkills: ["ISO 27001", "ISO 27005 (Gestão de Riscos)", "ISO 27701 (Privacidade/LGPD)", "Adequação LGPD", "Governança", "Compliance Geral", "Análise de Risco"],
      infrastructure: ["Notebook gamer de alto desempenho", "Acesso digital a normas ABNT e ISO"]
    },
    {
      name: "Consultoria de comunicação e marketing Digital",
      link: "https://sesisenaisp.sharepoint.com/:p:/r/sites/PPO-ComitdeTIeCybersegurana/Documentos%20Compartilhados/Comit%C3%AA%20de%20TI,%20IA%20e%20Cyberseguran%C3%A7a/Portf%C3%B3lio%20SENAI-SP/Product%20Lean%20Canvas%20-%20SGSET/Consultoria%20de%20Comunica%C3%A7%C3%A3o%20e%20Marketing%20Digital.pptx?d=w620aa68627e148cb900f33b602605a73&csf=1&web=1&e=EbC11T",
      relevantSkills: ["SEO", "Redes Sociais", "Google ADS", "Google Analytics", "Meta ADS", "E-mail Marketing", "Mídias Digitais", "Omnichannel"],
      infrastructure: []
    },
    {
      name: "Consultoria em projetos de TI aplicado a Indústria",
      link: "https://sesisenaisp.sharepoint.com/:p:/r/sites/PPO-ComitdeTIeCybersegurana/Documentos%20Compartilhados/Comit%C3%AA%20de%20TI,%20IA%20e%20Cyberseguran%C3%A7a/Portf%C3%B3lio%20SENAI-SP/Product%20Lean%20Canvas%20-%20SGSET/Consultoria%20em%20projetos%20de%20TI%20aplicado%20a%20ind%C3%BAstria.pptx?d=wf42954bb5be147369ba035da69a5a67e&csf=1&web=1&e=fr8gq7",
      relevantSkills: ["Scrum", "Kanban", "Clean Code", "Design Patterns", "SOLID", "DevOps", "ISA 62.443 (IEC 62443)"],
      infrastructure: ["Notebook gamer de alto desempenho", "Servidores locais e/ou híbridos"]
    },
    {
      name: "Consultoria em Sistemas ERP",
      link: "https://sesisenaisp.sharepoint.com/:p:/r/sites/PPO-ComitdeTIeCybersegurana/Documentos%20Compartilhados/Comit%C3%AA%20de%20TI,%20IA%20e%20Cyberseguran%C3%A7a/Portf%C3%B3lio%20SENAI-SP/Product%20Lean%20Canvas%20-%20SGSET/Consultoria%20em%20sistemas%20ERP.pptx?d=wa90db435c83a485dbe5046759abeef39&csf=1&web=1&e=Swe6po",
      relevantSkills: ["Gerenciamento de Banco de Dados", "SQL Server", "Oracle", "MySQL", "PostgreSQL", "API REST", "Serviços de Mensageria PUB/SUB"],
      infrastructure: ["Notebook gamer de alto desempenho", "SAP, Oracle ERP, Totvs Protheus", "Computação e armazenamento robustos"]
    },
    {
      name: "Desenvolvimento de aplicações Mobile",
      link: "https://sesisenaisp.sharepoint.com/:p:/r/sites/PPO-ComitdeTIeCybersegurana/Documentos%20Compartilhados/Comit%C3%AA%20de%20TI,%20IA%20e%20Cyberseguran%C3%A7a/Portf%C3%B3lio%20SENAI-SP/Product%20Lean%20Canvas%20-%20SGSET/Desenvolvimento%20de%20Aplica%C3%A7%C3%B5es%20Mobile.pptx?d=w9991e5fb156e4cf1a20ff64ee3393167&csf=1&web=1&e=qVOfGg",
      relevantSkills: ["React Native", "Flutter", "Swift", "Kotlin", "Dart", "API REST", "Firebase", "Publicação Apple Store", "Publicação Play Store"],
      infrastructure: ["Notebook gamer de alto desempenho", "Smartphones Android", "Smartphones iOS", "Tablets Android", "Tablets iOS", "MacBooks"]
    },
    {
      name: "Desenvolvimento de aplicações Web",
      link: "https://sesisenaisp.sharepoint.com/:p:/r/sites/PPO-ComitdeTIeCybersegurana/Documentos%20Compartilhados/Comit%C3%AA%20de%20TI,%20IA%20e%20Cyberseguran%C3%A7a/Portf%C3%B3lio%20SENAI-SP/Product%20Lean%20Canvas%20-%20SGSET/Desenvolvimento%20de%20Aplica%C3%A7%C3%B5es%20Web.pptx?d=w0d7fdcbede2b48fe84ad79e0565d112a&csf=1&web=1&e=Z5fM4s",
      relevantSkills: [
        "HTML", "CSS", "JavaScript", "TypeScript", "React", "Angular", "Next.js",
        "Node.js", "Express", "NestJS", "Python", "Java", "Spring Boot", "PHP", "C#", ".NET",
        "API REST", "Swagger",
        "PostgreSQL", "MySQL", "MongoDB", "SQL Server", "SQLite", "Redis",
        "Git", "GitHub", "Design Responsivo", "Bootstrap", "Tailwind CSS", "Materialize"
      ],
      infrastructure: ["Notebook gamer de alto desempenho", "Figma", "Assinatura Microsoft Azure", "Assinatura AWS", "Assinatura Google Cloud Platform", "GitHub"]
    },
    {
      name: "Desenvolvimento de soluções com IA",
      link: "https://sesisenaisp.sharepoint.com/:p:/r/sites/PPO-ComitdeTIeCybersegurana/Documentos%20Compartilhados/Comit%C3%AA%20de%20TI,%20IA%20e%20Cyberseguran%C3%A7a/Portf%C3%B3lio%20SENAI-SP/Product%20Lean%20Canvas%20-%20SGSET/Desenvolvimento%20de%20Solu%C3%A7%C3%B5es%20com%20IA%E2%80%8B.pptx?d=w1b11a20fa66e4cfda746637fc19387de&csf=1&web=1&e=BrdAAO",
      relevantSkills: [
        "Python", "Machine Learning", "Linguagem R", "Tensorflow", "Keras", "Scikit-learn", "OpenCV",
        "Processamento de Linguagem Natural (NLP)", "Langchain", "Large Language Modelos - LLMs", "Hugging Face",
        "Visão Computacional - Classificação", "Visão Computacional - Detecção de Objetos", "YOLO", "Reconhecimento de Caracteres", "Visão Computacional - Segmentação Semântica",
        "Redes Neurais Convolucionais(CNN)", "Redes Neurais Recorrentes (RNN)", "Generative adversarial network (GAN)",
        "Algoritmos Genéticos", "K-Means", "Modelos de Classificação", "Modelos de Regressão Linear", "Jupyter Notebooks", "Google Colab", "Pandas", "Matplotlib", "Seaborn", "MLOps"
      ],
      infrastructure: ["Notebook gamer de alto desempenho", "Servidor para processamento massivo e dedicado", "Assinatura Microsoft Azure", "Assinatura AWS", "Assinatura Google Cloud Platform"]
    },
    {
      name: "Desenvolvimento de soluções de integração de negócios",
      link: "",
      relevantSkills: ["API REST", "Microserviços", "Serviços de Mensageria PUB/SUB", "Apache Kafka", "RabbitMQ", "Pipelines ETL/ELT", "Node.js", "Java", "Spring Boot", "Python", "Websockets"],
      infrastructure: []
    },
    {
      name: "Softwares e soluções para análise de dados e criação de dashboards",
      link: "https://sesisenaisp.sharepoint.com/:p:/r/sites/PPO-ComitdeTIeCybersegurana/Documentos%20Compartilhados/Comit%C3%AA%20de%20TI,%20IA%20e%20Cyberseguran%C3%A7a/Portf%C3%B3lio%20SENAI-SP/Product%20Lean%20Canvas%20-%20SGSET/Desenvolvimento%20de%20Solu%C3%A7%C3%B5es%20de%20Int.%20de%20Neg%C3%B3cios%E2%80%8B.pptx?d=w2f498021b6e64de8b35d65403227f305&csf=1&web=1&e=5OS4r4",
      relevantSkills: [
        "Power BI", "Tableau",
        "SQL Server", "PostgreSQL", "MySQL", "Oracle", "Gerenciamento de Banco de Dados",
        "Python", "Pandas", "Matplotlib", "Seaborn", "Análise de Dados", "Análise exploratória",
        "Data Warehouse", "Data Lake", "Pipelines ETL/ELT", "Amazon Redshift", "Azure Synapse Analytics", "Google Big Query"
      ],
      infrastructure: ["Notebook gamer de alto desempenho", "Servidor para processamento massivo e dedicado", "Assinatura Microsoft Azure", "Assinatura AWS", "Assinatura Google Cloud Platform", "Power BI", "Tableau"]
    },
    {
      name: "Design de Produto Digital",
      link: "https://sesisenaisp.sharepoint.com/:p:/r/sites/PPO-ComitdeTIeCybersegurana/Documentos%20Compartilhados/Comit%C3%AA%20de%20TI,%20IA%20e%20Cyberseguran%C3%A7a/Portf%C3%B3lio%20SENAI-SP/Product%20Lean%20Canvas%20-%20SGSET/Design%20de%20Produto%20Digital%20ou%20Design%20UIUX.pptx?d=wce7215ab1f504eb48e681aafebb729ab&csf=1&web=1&e=ZrMror",
      relevantSkills: ["Figma", "UI", "UX", "Prototipagem", "Design Thinking", "Design System"],
      infrastructure: ["Notebook gamer de alto desempenho", "Figma", "Adobe Creative Cloud"]
    },
    {
      name: "Penetration Test em aplicações Web",
      link: "https://sesisenaisp.sharepoint.com/:p:/r/sites/PPO-ComitdeTIeCybersegurana/Documentos%20Compartilhados/Comit%C3%AA%20de%20TI,%20IA%20e%20Cyberseguran%C3%A7a/Portf%C3%B3lio%20SENAI-SP/Product%20Lean%20Canvas%20-%20SGSET/Penetration%20Test%20em%20Aplica%C3%A7%C3%B5es%20WEB%E2%80%8B.pptx?d=w660462eba03644b4b0bfe98027ba1966&csf=1&web=1&e=8SYYvJ",
      relevantSkills: ["Pentest", "OWASP ZAP", "Kali Linux", "JavaScript", "Segurança em Código (Security by Design)"],
      infrastructure: ["Notebook gamer de alto desempenho", "Toolkit para PenTest (Open Source)"]
    },
    {
      name: "Diagnóstico de comunicação e marketing digital",
      link: "",
      relevantSkills: ["Google Analytics", "SEO", "Redes Sociais", "Mídias Digitais"],
      infrastructure: []
    },
    {
      name: "Implementação ISO 27001",
      link: "https://sesisenaisp.sharepoint.com/:p:/r/sites/PPO-ComitdeTIeCybersegurana/Documentos%20Compartilhados/Comit%C3%AA%20de%20TI,%20IA%20e%20Cyberseguran%C3%A7a/Portf%C3%B3lio%20SENAI-SP/Product%20Lean%20Canvas%20-%20SGSET/Implementa%C3%A7%C3%A3o%20ISO%2027001.pptx?d=w5527301b3b624d46824f0f00ad4a19d0&csf=1&web=1&e=Z37nGc",
      relevantSkills: ["ISO 27001", "Governança", "Compliance Geral", "Análise de Risco", "Adequação LGPD", "ISO 27005 (Gestão de Riscos)"],
      infrastructure: ["Notebook gamer de alto desempenho"]
    },
    {
      name: "Implementação ISO 27002",
      link: "",
      relevantSkills: ["ISO 27001", "Governança", "Hardening", "Segurança em Redes"],
      infrastructure: ["Notebook gamer de alto desempenho", "Acesso digital a normas ABNT e ISO"]
    },
    {
      name: "Plano de ação digital",
      link: "",
      relevantSkills: ["SEO", "Redes Sociais", "Google ADS", "Meta ADS", "Google Analytics", "E-mail Marketing", "Mídias Digitais", "Omnichannel", "Scrum", "Kanban"],
      infrastructure: []
    },
    {
      name: "Penetration Test - Infraestrutura e Serviços",
      link: "https://sesisenaisp.sharepoint.com/:p:/r/sites/PPO-ComitdeTIeCybersegurana/Documentos%20Compartilhados/Comit%C3%AA%20de%20TI,%20IA%20e%20Cyberseguran%C3%A7a/Portf%C3%B3lio%20SENAI-SP/Product%20Lean%20Canvas%20-%20SGSET/Penetration%20Test%20%E2%80%93%20Infra%20e%20Servi%C3%A7os%E2%80%8B.pptx?d=wab0d6b5b8f2f4d45b0a41d76b4b67899&csf=1&web=1&e=0clvU2",
      relevantSkills: ["Pentest", "Segurança em Redes", "Kali Linux", "Hardening", "Servidores Linux", "Servidores Windows", "Amazon Web Services", "Azure", "Docker"],
      infrastructure: ["Notebook gamer de alto desempenho", "Toolkit para PenTest (Open Source)"]
    }
  ];

  let toastTimeout;
  function showToastNotification(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      console.error("Toast container not found!");
      alert(message);
      return;
    }
    if (toastTimeout) clearTimeout(toastTimeout);
    while (toastContainer.firstChild) {
      toastContainer.removeChild(toastContainer.firstChild);
    }
    const toast = document.createElement('div');
    toast.className = `fixed top-5 right-5 p-4 rounded-md shadow-lg text-white text-sm z-50 animate-toast-in`;
    if (type === 'success') toast.classList.add('bg-green-500');
    else if (type === 'error') toast.classList.add('bg-red-500');
    else toast.classList.add('bg-blue-500');
    toast.textContent = message;
    toastContainer.appendChild(toast);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('animate-toast-in');
      toast.classList.add('animate-toast-out');
      setTimeout(() => {
        toast.remove();
      }, 500);
    }, 3000);
  }

  function updateStats(members) {
    const statsSection = document.getElementById('stats-section');
    // A função isAdminUser() será chamada aqui. Se não estiver definida, causará erro.
    // Precisamos garantir que isAdminUser() do script.js seja usada.
    if (!isAdminUser() || !statsSection || statsSection.style.display === 'none') {
      if (document.getElementById('stats-total-members')) document.getElementById('stats-total-members').textContent = '0';
      if (document.getElementById('stats-backend-experts')) document.getElementById('stats-backend-experts').textContent = '0';
      if (document.getElementById('stats-full-stack')) document.getElementById('stats-full-stack').textContent = '0';
      if (document.getElementById('stats-frontend-devs')) document.getElementById('stats-frontend-devs').textContent = '0';
      if (document.getElementById('stats-mobile-devs')) document.getElementById('stats-mobile-devs').textContent = '0';
      return;
    }

    const totalMembers = members.length;
    let totalSkillsEvaluated = 0;
    const skillCounts = {};
    const skillLevelsSum = {};
    const categorySkillCounts = {};

    members.forEach(member => {
      const categories = ['backend', 'frontend', 'mobile', 'architecture', 'management', 'security', 'infra', 'data', 'immersive', 'marketing'];
      categories.forEach(category => {
        if (member[category] && Array.isArray(member[category])) {
          if (!categorySkillCounts[category]) {
            categorySkillCounts[category] = { totalLevel: 0, skillEntries: 0 };
          }
          member[category].forEach(skill => {
            if (skill.skillLevel > 0) {
              totalSkillsEvaluated++;
              skillCounts[skill.skillName] = (skillCounts[skill.skillName] || 0) + 1;
              skillLevelsSum[skill.skillName] = (skillLevelsSum[skill.skillName] || 0) + skill.skillLevel;
              categorySkillCounts[category].totalLevel += skill.skillLevel;
              categorySkillCounts[category].skillEntries++;
            }
          });
        }
      });
    });

    const averageSkillsPerMember = totalMembers > 0 ? (totalSkillsEvaluated / totalMembers).toFixed(1) : 0;
    const topSkillsArray = Object.entries(skillLevelsSum)
      .map(([name, totalLevel]) => ({ name, averageLevel: totalLevel / skillCounts[name], count: skillCounts[name] }))
      .sort((a, b) => b.averageLevel - a.averageLevel || b.count - a.count)
      .slice(0, 3);
    const categoryAverages = Object.entries(categorySkillCounts)
      .map(([name, data]) => ({ name, averageLevel: data.skillEntries > 0 ? (data.totalLevel / data.skillEntries) : 0 }))
      .sort((a, b) => b.averageLevel - a.averageLevel);

    const totalMembersEl = document.getElementById('stats-total-members');
    const avgSkillsEl = document.getElementById('stats-avg-skills'); // Este ID não existe no HTML, mas deixo a lógica
    const topSkillsListEl = document.getElementById('stats-top-skills-list'); // Este ID não existe no HTML
    const topCategoriesListEl = document.getElementById('stats-top-categories-list'); // Este ID não existe no HTML

    if (totalMembersEl) totalMembersEl.textContent = totalMembers;

    // Backend Experts: Pelo menos uma skill backend com nível >= 4
    const backendExpertsCount = members.filter(m =>
      m.backend && m.backend.some(s => s.skillLevel >= 4)
    ).length;
    if (document.getElementById('stats-backend-experts')) document.getElementById('stats-backend-experts').textContent = backendExpertsCount;

    // Frontend Devs: Pelo menos uma skill frontend com nível > 0
    const frontendDevsCount = members.filter(m =>
      m.frontend && m.frontend.some(s => s.skillLevel > 0)
    ).length;
    if (document.getElementById('stats-frontend-devs')) document.getElementById('stats-frontend-devs').textContent = frontendDevsCount;

    // Full Stack: Pelo menos uma skill backend com nível > 0 E pelo menos uma skill frontend com nível > 0
    const fullStackCount = members.filter(m =>
      (m.backend && m.backend.some(s => s.skillLevel > 0)) &&
      (m.frontend && m.frontend.some(s => s.skillLevel > 0))
    ).length;
    if (document.getElementById('stats-full-stack')) document.getElementById('stats-full-stack').textContent = fullStackCount;

    // Mobile Devs: Pelo menos uma skill mobile com nível > 0
    const mobileDevsCount = members.filter(m =>
      m.mobile && m.mobile.some(s => s.skillLevel > 0)
    ).length;
    if (document.getElementById('stats-mobile-devs')) document.getElementById('stats-mobile-devs').textContent = mobileDevsCount;

    if (topSkillsListEl) {
      topSkillsListEl.innerHTML = '';
      if (topSkillsArray.length > 0) {
        topSkillsArray.forEach(skill => {
          const li = document.createElement('li');
          li.className = 'text-xs text-gray-600';
          li.innerHTML = `${skill.name} <span class="font-semibold">(Nível Médio: ${skill.averageLevel.toFixed(1)}, ${skill.count} devs)</span>`;
          topSkillsListEl.appendChild(li);
        });
      } else {
        topSkillsListEl.innerHTML = '<li class="text-xs text-gray-500 italic">Nenhuma skill avaliada.</li>';
      }
    }

    if (topCategoriesListEl) {
      topCategoriesListEl.innerHTML = '';
      if (categoryAverages.length > 0) {
        categoryAverages.slice(0, 3).forEach(cat => {
          const li = document.createElement('li');
          li.className = 'text-xs text-gray-600';
          const categoryName = cat.name.charAt(0).toUpperCase() + cat.name.slice(1);
          li.innerHTML = `${categoryName} <span class="font-semibold">(Nível Médio: ${cat.averageLevel.toFixed(1)})</span>`;
          topCategoriesListEl.appendChild(li);
        });
      } else {
        topCategoriesListEl.innerHTML = '<li class="text-xs text-gray-500 italic">Nenhuma categoria com skills avaliadas.</li>';
      }
    }
  }


  // ---------------------------------------------------------------------------
  // FUNÇÃO isAdminUser - Deve ser a única definição desta função
  // ---------------------------------------------------------------------------
  function isAdminUser() {
    const userEmail = localStorage.getItem('userEmail');
    console.log('[isAdminUser] userEmail from localStorage:', userEmail);
    const isAdmin = userEmail && userEmail.toLowerCase() === 'admin@sp.senai.br';
    console.log('[isAdminUser] isAdmin result:', isAdmin);
    return isAdmin;
  }

  // ---------------------------------------------------------------------------
  // LÓGICA PRINCIPAL DA APLICAÇÃO
  // ---------------------------------------------------------------------------

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
      allTeamMembersGlobal = team.filter(member => member.id.toString() !== loggedInUserId);
      console.log('[fetchAllTeamProfiles] Filtered allTeamMembersGlobal (admin removed):', JSON.parse(JSON.stringify(allTeamMembersGlobal)));
      allTeamMembersGlobal.sort((a, b) => {
        const nameA = (a.fullName || a.name || '').toLowerCase();
        const nameB = (b.fullName || b.name || '').toLowerCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
      });
      displayTeamMembers(allTeamMembersGlobal);
      updateStats(allTeamMembersGlobal);
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
      const skillCategories = ['backend', 'frontend', 'mobile', 'architecture', 'management', 'security', 'infra', 'data', 'immersive', 'marketing'];
      skillCategories.forEach(category => {
        myProfile[category] = myProfile[category] || [];
      });
      allTeamMembersGlobal = [myProfile];
      displayTeamMembers(myProfile);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      if (teamContainer) {
        teamContainer.innerHTML = '<p class="text-red-500 text-center col-span-full">Erro ao carregar seu perfil. Tente fazer login novamente.</p>';
      }
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
    console.log('[displayTeamMembers] membersArray after ensuring array:', JSON.parse(JSON.stringify(membersArray)));

    if (!membersArray || membersArray.length === 0 || !membersArray[0]) {
      console.log('[displayTeamMembers] No members to display or first member is falsy.');
      teamContainer.innerHTML = '<p class="text-gray-600 col-span-full text-center">Nenhum membro encontrado.</p>';
      if (isAdminUser()) updateStats([]);
      return;
    }

    const isAdminNow = isAdminUser();
    console.log('[displayTeamMembers] isAdminUser() check in displayTeamMembers:', isAdminNow);

    if (!isAdminNow && membersArray.length === 1) {
      teamContainer.className = 'grid grid-cols-1 gap-6';
    } else if (isAdminNow) {
      console.log('[displayTeamMembers] Applying multi-card admin layout.');
      teamContainer.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6';
    } else {
      console.log('[displayTeamMembers] Condition for layout not met, isAdminNow:', isAdminNow, 'membersArray.length:', membersArray.length);
      teamContainer.className = 'grid grid-cols-1 gap-6';
    }

    membersArray.forEach(member => {
      const names = (member.name || "Usuário").split(' ');
      const initials = names.length > 1
        ? `${names[0][0]}${names[names.length - 1][0]}`
        : (names[0] ? names[0][0] : 'U');

      // Calcula todas as skills listadas para o membro (para a lógica de "+X" das top skills)
      const allListedSkillsObjects = [
        ...(member.backend || []), ...(member.frontend || []), ...(member.mobile || []),
        ...(member.architecture || []), ...(member.management || []), ...(member.security || []),
        ...(member.infra || []), ...(member.data || []), ...(member.immersive || []),
        ...(member.marketing || [])
      ];
      const totalListedSkills = allListedSkillsObjects.length;

      // Calcula o número de skills efetivamente preenchidas (nível > 0)
      const filledSkillsCount = allListedSkillsObjects.filter(skill => skill.skillLevel > 0).length;

      // Defina aqui o número total de competências possíveis no sistema.
      // Ajuste este valor conforme o número real de todas as skills disponíveis para avaliação.
      const totalPossibleSkills = 203;

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
      if (!isAdminNow && membersArray.length === 1) {
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
                    <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">${filledSkillsCount} de ${totalPossibleSkills} competências</span>
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
                        ${totalListedSkills > 3 ? `<span class="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">+${totalListedSkills - 3}</span>` : ''}
                    </div>
                </div>
                ${isAdminNow && member.id.toString() !== localStorage.getItem('userId') ? `
                <div class="mt-4 pt-3 border-t border-gray-200 flex justify-end space-x-2">
                    <button class="edit-user-btn text-xs px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition" data-user-id="${member.id}">
                        <i class="fas fa-edit mr-1"></i>Editar
                    </button>
                    <button class="delete-user-btn text-xs px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition" data-user-id="${member.id}" data-user-name="${member.fullName}">
                        <i class="fas fa-trash-alt mr-1"></i>Excluir
                    </button>
                </div>` : ''}
            </div>
        </div>`;
      const viewProfileBtn = card.querySelector('.view-profile-btn');
      viewProfileBtn.addEventListener('click', () => openProfileModal(member));
      card.querySelector('.edit-user-btn')?.addEventListener('click', () => openEditUserModal(member));
      card.querySelector('.delete-user-btn')?.addEventListener('click', () => handleDeleteUser(member.id, member.fullName));
      teamContainer.appendChild(card);
    });
    if (isAdminNow) updateStats(membersArray);
  }

  // Open profile modal
  function openProfileModal(member) {
    currentProfileInModalId = member.id;
    const names = (member.name || "Usuário").split(' ');
    const initials = names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}` : (names[0] ? names[0][0] : 'U');
    const loggedInUserId = localStorage.getItem('userId');
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

    // Filtra para incluir apenas skills com nível > 0, depois ordena e pega as top 5
    const topRatedSkills = allSkills
      .filter(skill => skill.skillLevel && skill.skillLevel > 0)
      .sort((a, b) => b.skillLevel - a.skillLevel) // Agora skillLevel é garantido ser um número > 0
      .slice(0, 5);

    if (topRatedSkills.length === 0) {
      topSkillsContainer.innerHTML = '<span class="text-xs text-gray-500 italic">Nenhuma habilidade principal avaliada.</span>';
    } else {
      topRatedSkills.forEach(skillObj => {
        const chip = document.createElement('span');
        chip.className = 'skill-chip text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full mb-1';
        chip.textContent = `${skillObj.skillName} (Nível ${skillObj.skillLevel})`; // skillLevel é garantido aqui
        topSkillsContainer.appendChild(chip);
      });
    }

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
        selectLevel.disabled = true;
        if (isAdminEditingOtherUser) {
          selectLevel.disabled = false;
        } else if (isOwnerEditingOwnProfile) {
          if (skillData.skillLevel === 0 || typeof skillData.skillLevel === 'undefined') {
            selectLevel.disabled = false;
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
        tooltipText.className = 'text-xs text-gray-600 mt-2 proficiency-tooltip bg-gray-100 p-2 rounded-md border border-gray-200';
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
        updateTooltip(selectLevel.value, skillData.skillName);
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

    // Calcula a porcentagem de skills preenchidas por área
    const areaCompletionPercentages = areaKeys.map(key => {
      const skillsInCategory = member[key] || []; // Garante que é um array
      const totalPossibleSkillsInArea = skillsInCategory.length;

      if (totalPossibleSkillsInArea === 0) {
        return 0; // Se não há skills definidas para esta área no perfil, a completude é 0%
      }

      const filledSkillsInArea = skillsInCategory.filter(skill => skill.skillLevel && skill.skillLevel > 0).length;
      const percentage = (filledSkillsInArea / totalPossibleSkillsInArea) * 100;
      return parseFloat(percentage.toFixed(2)); // Retorna com até 2 casas decimais
    });

    const ctx = document.getElementById('modal-chart').getContext('2d');
    if (currentChartInstance) currentChartInstance.destroy();
    currentChartInstance = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: areaLabels,
        datasets: [{
          label: 'Preenchimento da Área (%)', data: areaCompletionPercentages, fill: true,
          backgroundColor: 'rgba(59, 130, 246, 0.2)', borderColor: 'rgb(59, 130, 246)',
          pointBackgroundColor: 'rgb(59, 130, 246)', pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff', pointHoverBorderColor: 'rgb(59, 130, 246)'
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: true,
        scales: {
          r: {
            angleLines: { display: true },
            suggestedMin: 0,
            suggestedMax: 100, // Escala de 0 a 100 para porcentagem
            ticks: {
              stepSize: 20,
              callback: function (value) { return value + "%" } // Adiciona % aos ticks
            }
          }
        },
        plugins: {
          legend: { display: true, position: 'top' }, // Mostrar legenda para clareza
          tooltip: {
            callbacks: {
              label: function (context) {
                let label = context.dataset.label || '';
                if (label) { label += ': '; }
                if (context.parsed.r !== null) {
                  label += context.parsed.r.toFixed(2) + '%'; // Adiciona % ao valor do tooltip
                }
                return label;
              }
            }
          }
        }
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

    // Regenerar as abas para incluir a contagem de skills
    const competencyTabsContainer = document.getElementById('competency-tabs');
    competencyTabsContainer.innerHTML = ''; // Limpa as abas existentes

    areaKeys.forEach((key, index) => {
      const skillsInCategory = member[key] || [];
      const skillCount = skillsInCategory.length;
      const tabButton = document.createElement('li');
      tabButton.className = `mr-2 ${index === areaKeys.length - 1 ? '' : ''}`; // Adiciona mr-2 exceto para o último
      tabButton.setAttribute('role', 'presentation');
      tabButton.innerHTML = `
            <button class="inline-block p-3 border-b-2 rounded-t-lg ${index === 0 ? 'text-blue-600 border-blue-600' : 'hover:text-gray-600 hover:border-gray-300 border-transparent'}"
                    id="${key}-tab"
                    data-tabs-target="#${key}-content"
                    type="button"
                    role="tab"
                    aria-controls="${key}"
                    aria-selected="${index === 0 ? 'true' : 'false'}">
                ${areaLabels[index]} (${skillCount})
            </button>`;
      competencyTabsContainer.appendChild(tabButton);
    });

    const tabs = document.querySelectorAll('#competency-tabs button[role="tab"]'); // Seleciona as novas abas
    const tabContents = document.querySelectorAll('#competency-tab-content div[role="tabpanel"]');
    tabs.forEach(tab => { // Adiciona listeners às novas abas
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
    if (tabs.length > 0) tabs[0].click(); // Ativa a primeira aba por padrão

    const allIndividualSkills = [];
    areaKeys.forEach(categoryKey => {
      if (member[categoryKey] && Array.isArray(member[categoryKey])) {
        member[categoryKey].forEach(skill => {
          if (skill.skillLevel > 0) {
            allIndividualSkills.push({ name: skill.skillName, level: skill.skillLevel, levelText: proficiencyLevels.find(p => p.level === skill.skillLevel)?.label || '' });
          }
        });
      }
    });
    const topIndividualSkills = allIndividualSkills.sort((a, b) => b.level - a.level).slice(0, 10);
    const skillsChartCtx = document.getElementById('modal-skills-chart').getContext('2d');
    if (currentSkillsChartInstance) currentSkillsChartInstance.destroy();
    if (topIndividualSkills.length > 0) {
      document.getElementById('modal-skills-chart').style.display = 'block';
      currentSkillsChartInstance = new Chart(skillsChartCtx, {
        type: 'bar',
        data: {
          labels: topIndividualSkills.map(s => s.name),
          datasets: [{
            label: 'Nível de Proficiência', data: topIndividualSkills.map(s => s.level),
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
        member[categoryKey].forEach(skill => { if (skill.skillLevel > 0) { memberSkillsWithLevel.push(skill.skillName); } });
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
          const itemNameLink = document.createElement('a');
          itemNameLink.href = item.link; itemNameLink.target = '_blank'; itemNameLink.rel = 'noopener noreferrer';
          itemNameLink.textContent = item.name; itemNameLink.className = 'hover:underline focus:outline-none focus:ring-2 focus:ring-blue-300 rounded';
          itemName.appendChild(itemNameLink);
          const linkIcon = document.createElement('a');
          linkIcon.href = item.link; linkIcon.target = '_blank'; linkIcon.rel = 'noopener noreferrer';
          linkIcon.innerHTML = '<i class="fas fa-external-link-alt text-blue-500 hover:text-blue-700 ml-2 text-xs" title="Abrir anexo"></i>';
          itemName.appendChild(linkIcon);
        } else {
          itemName.textContent = item.name;
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
    const existingSubmittedMessage = competencyTabsContainer.previousElementSibling; // competencyTabsContainer já foi definido acima
    if (existingSubmittedMessage && existingSubmittedMessage.classList.contains('skills-submitted-info')) {
      existingSubmittedMessage.remove();
    }
    const canEffectivelyEditSkills = isOwnerOfProfile || isAdminViewingOtherProfile;
    if (canEffectivelyEditSkills) {
      let saveButton = modalFooter.querySelector('#save-skills-btn');
      if (!saveButton) {
        saveButton = document.createElement('button');
        saveButton.id = 'save-skills-btn';
        saveButton.className = 'px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition mr-2';
        saveButton.textContent = 'Salvar Habilidades';
        saveButton.addEventListener('click', saveSkills);
        modalFooter.insertBefore(saveButton, modalFooter.firstChild);
      }
      saveButton.style.display = 'inline-block';
    } else {
      if (saveButton) saveButton.style.display = 'none';
    }

    const openCompetenciesTableViewBtn = document.getElementById('open-competencies-table-view-btn');
    if (openCompetenciesTableViewBtn) {
      const newBtn = openCompetenciesTableViewBtn.cloneNode(true);
      openCompetenciesTableViewBtn.parentNode.replaceChild(newBtn, openCompetenciesTableViewBtn);
      newBtn.addEventListener('click', () => openCompetenciesTableModal(member));
    } else {
      console.warn("Botão 'open-competencies-table-view-btn' não encontrado.");
    }
    if (profileModal) profileModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  // Função para popular a tabela de competências detalhadas
  function populateCompetenciesTable(member, containerId) {
    const tableContainer = document.getElementById(containerId);
    if (!tableContainer) return;
    tableContainer.innerHTML = '';
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
      </tr>`;
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    tbody.className = 'bg-white divide-y divide-gray-200';
    let evaluatedSkillsCount = 0;
    const areaKeys = ['backend', 'frontend', 'mobile', 'architecture', 'management', 'security', 'infra', 'data', 'immersive', 'marketing'];
    const categoryDisplayNames = { backend: 'Backend', frontend: 'Frontend', mobile: 'Mobile', architecture: 'Arquitetura', management: 'Gestão', security: 'Segurança', infra: 'Infra', data: 'Dados/IA', immersive: 'Imersivas', marketing: 'Marketing' };
    areaKeys.forEach(categoryKey => {
      if (member[categoryKey] && Array.isArray(member[categoryKey])) {
        member[categoryKey].forEach(skill => {
          if (skill.skillLevel > 0) {
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
              <td class="px-4 py-3 text-sm text-gray-600">${description}</td>`;
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
    } else {
      console.error("Elemento 'competencies-table-modal' não encontrado.");
    }
  }

  let isSavingSkills = false;
  async function saveSkills() {
    if (isSavingSkills) {
      console.log("SaveSkills: Já está salvando, ignorando chamada duplicada.");
      return;
    }
    isSavingSkills = true;
    console.log("SaveSkills: Iniciando salvamento...");
    const targetUserIdForSave = currentProfileInModalId;
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
      if (!updatedSkills[category]) updatedSkills[category] = [];
      updatedSkills[category].push({ skillName, skillLevel });
    });
    const token = localStorage.getItem('authToken');
    const loggedInUserId = localStorage.getItem('userId');
    const isAdminSaving = isAdminUser();
    const isEditingOwnProfile = loggedInUserId === targetUserIdForSave.toString();
    let endpoint = '';
    if (isAdminSaving && !isEditingOwnProfile) {
      endpoint = `https://dev-team.onrender.com/api/users/${targetUserIdForSave}/skills`;
    } else if (isEditingOwnProfile) {
      endpoint = 'https://dev-team.onrender.com/api/users/me/profile/skills';
    } else {
      showToastNotification("Não autorizado a salvar estas habilidades.", 'error');
      isSavingSkills = false;
      return;
    }
    try {
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ skills: updatedSkills })
      });
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          const errorText = await response.text();
          if (errorText) errorMessage += ` - ${errorText}`;
        }
        throw new Error(errorMessage);
      }
      const result = await response.json();
      showToastNotification("Salvo com sucesso", 'success'); // Mensagem fixa de sucesso
      closeProfileModal();
      if (isAdminUser()) {
        fetchAllTeamProfiles();
      } else {
        fetchMyProfile();
      }
    } catch (error) {
      console.error("Erro detalhado ao salvar habilidades:", error);
      showToastNotification(`Erro ao salvar habilidades: ${error.message}`, 'error');
    } finally {
      isSavingSkills = false;
    }
  }

  // Close profile modal
  function closeProfileModal() {
    if (profileModal) profileModal.classList.add('hidden');
    if (currentChartInstance) { currentChartInstance.destroy(); currentChartInstance = null; }
    if (currentSkillsChartInstance) { currentSkillsChartInstance.destroy(); currentSkillsChartInstance = null; }
    currentProfileInModalId = null;
    document.body.style.overflow = 'auto';
  }

  // Filter team members (for Admin view)
  function filterTeamMembers() {
    if (!isAdminUser()) {
      displayTeamMembers(allTeamMembersGlobal);
      return;
    }
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
    let filtered = [...allTeamMembersGlobal];
    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchTerm) ||
        member.fullName.toLowerCase().includes(searchTerm)
      );
    }
    displayTeamMembers(filtered);
    updateStats(filtered);
  }

  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userId');
      window.location.href = 'login.html';
    });
  } else {
    console.warn("Botão de logout não encontrado.");
  }

  function checkLoginStatus() {
    const token = localStorage.getItem('authToken');
    const userName = localStorage.getItem('userName');
    console.log('[checkLoginStatus] Token:', token, 'UserName:', userName);

    if (token && userName) {
      if (userProfileSection) userProfileSection.classList.remove('hidden');
      if (welcomeMessage) welcomeMessage.textContent = `Bem-vindo(a), ${userName}!`;

      const isAdmin = isAdminUser(); // ESTA LINHA CAUSA O ERRO SE isAdminUser NÃO ESTIVER DEFINIDA CORRETAMENTE
      console.log('[checkLoginStatus] isAdminUser() returned:', isAdmin);

      if (isAdmin) {
        console.log('[checkLoginStatus] Admin path taken.');
        if (showCreateUserModalBtn) {
          showCreateUserModalBtn.classList.remove('hidden');
        } else {
          console.warn('[checkLoginStatus] Admin user, but showCreateUserModalBtn not found.');
        }
        const filtersSection = document.getElementById('filters-section');
        const categoriesSection = document.getElementById('categories-section');
        const statsSection = document.getElementById('stats-section');
        if (filtersSection) filtersSection.style.display = 'block';
        if (categoriesSection) categoriesSection.style.display = 'block';
        if (statsSection) statsSection.style.display = 'grid';
        initializeFiltersAndCategories();
        fetchAllTeamProfiles();
      } else {
        console.log('[checkLoginStatus] Non-admin path taken.');
        const filtersSection = document.getElementById('filters-section');
        const categoriesSection = document.getElementById('categories-section');
        const statsSection = document.getElementById('stats-section');
        if (filtersSection) filtersSection.style.display = 'none';
        if (showCreateUserModalBtn) showCreateUserModalBtn.classList.add('hidden');
        if (categoriesSection) categoriesSection.style.display = 'none';
        if (statsSection) statsSection.style.display = 'none';
        fetchMyProfile();
      }
    } else {
      console.log('[checkLoginStatus] No token or userName, redirecting to login.');
      window.location.href = 'login.html';
    }
  }

  function initializeFiltersAndCategories() {
    const categoryTabs = document.querySelectorAll('.category-tab');
    if (searchInput) {
      searchInput.addEventListener('input', filterTeamMembers);
    }
    categoryTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        categoryTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        filterTeamMembers();
      });
    });
  }

  // --- Create User Modal Logic ---
  if (showCreateUserModalBtn) {
    showCreateUserModalBtn.addEventListener('click', () => {
      if (createUserModal) createUserModal.classList.remove('hidden');
      if (createUserForm) createUserForm.reset();
      if (createUserMessage) {
        createUserMessage.textContent = '';
        createUserMessage.className = 'mt-3 text-sm text-center';
      }
    });
  }
  if (closeCreateUserModalBtn) {
    closeCreateUserModalBtn.addEventListener('click', () => {
      if (createUserModal) createUserModal.classList.add('hidden');
    });
  }
  if (createUserForm) {
    createUserForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (createUserMessage) createUserMessage.textContent = '';
      const submitButton = document.getElementById('create-user-submit-btn');
      if (submitButton) { submitButton.disabled = true; submitButton.textContent = 'Criando...'; }
      const fullName = document.getElementById('new-user-fullname').value;
      const email = document.getElementById('new-user-email').value;
      const unit = document.getElementById('new-user-unit').value;
      const name = fullName.split(' ')[0];
      const password = "password123";
      try {
        const response = await fetch('https://dev-team.onrender.com/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: email, password, name, fullName, unit })
        });
        const data = await response.json();
        if (response.ok) {
          showToastNotification(data.message || "Usuário criado com sucesso!", 'success');
          fetchAllTeamProfiles();
          setTimeout(() => { if (createUserModal) createUserModal.classList.add('hidden'); }, 2000);
        } else {
          showToastNotification(data.message || 'Falha ao criar usuário.', 'error');
        }
      } catch (error) {
        console.error('Create user error:', error);
        showToastNotification('Erro ao tentar criar usuário. Verifique a conexão.', 'error');
      } finally {
        if (submitButton) { submitButton.disabled = false; submitButton.textContent = 'Criar Usuário'; }
      }
    });
  }

  // --- Edit User Modal Logic ---
  function openEditUserModal(member) {
    if (editUserModal) editUserModal.classList.remove('hidden');
    if (editUserForm) editUserForm.reset();
    if (editUserMessage) { editUserMessage.textContent = ''; editUserMessage.className = 'mt-3 text-sm text-center'; }
    document.getElementById('edit-user-id').value = member.id;
    document.getElementById('edit-user-fullname').value = member.fullName;
    document.getElementById('edit-user-email').value = member.username;
    document.getElementById('edit-user-unit').value = member.unit || '';
  }
  if (closeEditUserModalBtn) {
    closeEditUserModalBtn.addEventListener('click', () => { if (editUserModal) editUserModal.classList.add('hidden'); });
  }
  if (editUserForm) {
    editUserForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (editUserMessage) editUserMessage.textContent = '';
      const submitButton = document.getElementById('edit-user-submit-btn');
      if (submitButton) { submitButton.disabled = true; submitButton.textContent = 'Salvando...'; }
      const userId = document.getElementById('edit-user-id').value;
      const fullName = document.getElementById('edit-user-fullname').value;
      const email = document.getElementById('edit-user-email').value;
      const unit = document.getElementById('edit-user-unit').value;
      const token = localStorage.getItem('authToken');
      try {
        const response = await fetch(`https://dev-team.onrender.com/api/users/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ fullName, email, unit })
        });
        const data = await response.json();
        if (response.ok) {
          showToastNotification(data.message || "Usuário atualizado com sucesso!", 'success');
          fetchAllTeamProfiles();
          setTimeout(() => { if (editUserModal) editUserModal.classList.add('hidden'); }, 2000);
        } else {
          showToastNotification(data.message || 'Falha ao atualizar usuário.', 'error');
        }
      } catch (error) {
        console.error('Edit user error:', error);
        showToastNotification('Erro ao tentar atualizar usuário.', 'error');
      } finally {
        if (submitButton) { submitButton.disabled = false; submitButton.textContent = 'Salvar Alterações'; }
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
        if (response.ok) fetchAllTeamProfiles();
      } catch (error) {
        console.error('Delete user error:', error);
        showToastNotification('Erro ao tentar excluir usuário.', 'error');
      }
    }
  }

  // --- Change Password Modal Logic ---
  if (showChangePasswordModalBtn) {
    showChangePasswordModalBtn.addEventListener('click', () => {
      if (changePasswordModal) changePasswordModal.classList.remove('hidden');
      if (changePasswordForm) changePasswordForm.reset();
      if (changePasswordMessage) {
        changePasswordMessage.textContent = '';
        changePasswordMessage.className = 'mt-3 text-sm text-center';
      }
    });
  }

  if (closeChangePasswordModalBtn) {
    closeChangePasswordModalBtn.addEventListener('click', () => {
      if (changePasswordModal) changePasswordModal.classList.add('hidden');
    });
  }

  async function handleChangePassword(event) {
    event.preventDefault();
    if (changePasswordMessage) changePasswordMessage.textContent = '';

    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmNewPassword = document.getElementById('confirm-new-password').value;

    if (newPassword !== confirmNewPassword) {
      if (changePasswordMessage) {
        changePasswordMessage.textContent = 'A nova senha e a confirmação não correspondem.';
        changePasswordMessage.className = 'mt-3 text-sm text-center text-red-600';
      }
      return;
    }
    if (!newPassword) {
      if (changePasswordMessage) {
        changePasswordMessage.textContent = 'A nova senha não pode estar em branco.';
        changePasswordMessage.className = 'mt-3 text-sm text-center text-red-600';
      }
      return;
    }

    const submitButton = document.getElementById('change-password-submit-btn');
    if (submitButton) { submitButton.disabled = true; submitButton.textContent = 'Salvando...'; }

    const token = localStorage.getItem('authToken');
    try {
      // Use a rota /me/password para alterar a senha
      const response = await fetch('https://dev-team.onrender.com/api/users/me/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ oldPassword: currentPassword, newPassword })
      });
      const data = await response.json();
      if (response.ok) {
        showToastNotification(data.message || "Senha alterada com sucesso!", 'success');
        if (changePasswordModal) changePasswordModal.classList.add('hidden');
        if (changePasswordForm) changePasswordForm.reset();
      } else {
        showToastNotification(data.message || 'Falha ao alterar a senha.', 'error', changePasswordMessage);
      }
    } catch (error) {
      console.error('Change password error:', error);
      showToastNotification('Erro ao tentar alterar a senha. Verifique a conexão.', 'error', changePasswordMessage);
    } finally {
      if (submitButton) { submitButton.disabled = false; submitButton.textContent = 'Salvar Nova Senha'; }
    }
  }
  if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', handleChangePassword);
  }

  // Event listeners
  const closeModalButton = document.getElementById('close-modal');
  if (closeModalButton) {
    closeModalButton.addEventListener('click', closeProfileModal);
  } else {
    console.warn("Elemento 'close-modal' (botão X do modal de perfil) não encontrado.");
  }
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeProfileModal);
  }

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
});
