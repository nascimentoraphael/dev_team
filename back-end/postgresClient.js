// postgresClient.js
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { URL } = require('url');

// Corrige parsing da URL e força IPv4
const dbUrl = new URL(process.env.DATABASE_URL);
console.log("URL do banco carregada do ambiente:", dbUrl.href);

const pool = new Pool({
  host: dbUrl.hostname,
  port: dbUrl.port,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.slice(1),
  ssl: { rejectUnauthorized: false },
  family: 4
});

const SKILL_CATEGORIES_JSON_KEYS = {
  backend: "DESENVOLVIMENTO BACKEND (27)",
  frontend: "DESENVOLVIMENTO FRONTEND (23)",
  mobile: "DESENVOLVIMENTO FRONTEND APLICATIVOS (10)",
  architecture: "ARQUITETURA DE SOFTWARE (19)",
  management: "GESTÃO E OPERAÇÃO (05)",
  security: "SEGURANÇA DA INFORMAÇÃO E CONFORMIDADE (18)",
  infra: "TECNOLOGIA E INFRAESTRUTURA DE TI (31)",
  data: "DADOS E INTELIGÊNCIA ARTIFICIAL (49)",
  immersive: "TECNOLOGIAS IMERSIVAS (16)",
  marketing: "MARKETING DIGITAL E MÍDIAS SOCIAIS (08)",
  blockchain: "BLOCKCHAIN (07)"
};



async function insertInitialData(pool) {
  const initialUsers = [
    {
      username: "italo@sp.senai.br", password: "password123", name: "Italo Ignacio", fullName: "Italo Felipe Ignacio", unit: "1.27", lastUpdate: new Date().toISOString(),
      backend: JSON.stringify([
        { skillName: ".NET", skillLevel: 0 }, { skillName: "API REST", skillLevel: 0 }, { skillName: "AssertJ", skillLevel: 0 },
        { skillName: "Banco de dados de Grafos", skillLevel: 0 }, { skillName: "C#", skillLevel: 0 }, { skillName: "DBeaver", skillLevel: 0 },
        { skillName: "Entity Framework", skillLevel: 0 }, { skillName: "Express", skillLevel: 0 }, { skillName: "Fastify", skillLevel: 0 },
        { skillName: "Gerenciamento de Banco de Dados", skillLevel: 0 }, { skillName: "Java", skillLevel: 0 }, { skillName: "MongoDB", skillLevel: 0 },
        { skillName: "MySQL", skillLevel: 0 }, { skillName: "Node.js", skillLevel: 0 }, { skillName: "Oracle", skillLevel: 0 },
        { skillName: "PHP", skillLevel: 0 }, { skillName: "PostgreSQL", skillLevel: 0 }, { skillName: "Python", skillLevel: 0 },
        { skillName: "Redis", skillLevel: 0 }, { skillName: "Spring Boot", skillLevel: 0 }, { skillName: "Spring Data", skillLevel: 0 },
        { skillName: "Spring JPA", skillLevel: 0 }, { skillName: "SQL Server", skillLevel: 0 }, { skillName: "SQLite", skillLevel: 0 },
        { skillName: "Swagger", skillLevel: 0 }, { skillName: "Xunit", skillLevel: 0 }, { skillName: "NestJS", skillLevel: 0 },
        { skillName: "Quarckus", skillLevel: 0 }
      ]),
      frontend: JSON.stringify([
        { skillName: "Angular", skillLevel: 0 }, { skillName: "Axios", skillLevel: 0 }, { skillName: "Bootstrap", skillLevel: 0 },
        { skillName: "Context API", skillLevel: 0 }, { skillName: "CSS", skillLevel: 0 }, { skillName: "Cypress", skillLevel: 0 },
        { skillName: "Design Responsivo", skillLevel: 0 }, { skillName: "HTML", skillLevel: 0 }, { skillName: "Insomnia", skillLevel: 0 },
        { skillName: "JavaScript", skillLevel: 0 }, { skillName: "Jest", skillLevel: 0 }, { skillName: "Materialize", skillLevel: 0 },
        { skillName: "Next.js", skillLevel: 0 }, { skillName: "React Hook Form", skillLevel: 0 }, { skillName: "React Query", skillLevel: 0 },
        { skillName: "Redux", skillLevel: 0 }, { skillName: "Styled-components", skillLevel: 0 },
        { skillName: "React", skillLevel: 0 }, { skillName: "Tailwind CSS", skillLevel: 0 }, { skillName: "TypeScript", skillLevel: 0 },
        { skillName: "StoryBook", skillLevel: 0 }, { skillName: "UI", skillLevel: 0 }, { skillName: "UX", skillLevel: 0 }
      ]),
      mobile: JSON.stringify([
        { skillName: "Dart", skillLevel: 0 }, { skillName: "Desenvolvimento Smart TV", skillLevel: 0 },
        { skillName: "Desenvolvimento Smart Watch", skillLevel: 0 }, { skillName: "Electron", skillLevel: 0 },
        { skillName: "Flutter", skillLevel: 0 }, { skillName: "Kotlin", skillLevel: 0 },
        { skillName: "Publicação em Apple Store", skillLevel: 0 }, { skillName: "Publicação em Play Store", skillLevel: 0 },
        { skillName: "React Native", skillLevel: 0 }, { skillName: "Swift", skillLevel: 0 }
      ]),
      architecture: JSON.stringify([
        { skillName: "Aplicações Monolíticas", skillLevel: 0 }, { skillName: "Clean Code", skillLevel: 0 },
        { skillName: "Codereview", skillLevel: 0 }, { skillName: "Design Patterns", skillLevel: 0 },
        { skillName: "Design System", skillLevel: 0 }, { skillName: "Design Thinking", skillLevel: 0 },
        { skillName: "Documentação de Software", skillLevel: 0 }, { skillName: "Figma", skillLevel: 0 },
        { skillName: "Firebase", skillLevel: 0 }, { skillName: "Git", skillLevel: 0 }, { skillName: "GitHub", skillLevel: 0 },
        { skillName: "Microserviços", skillLevel: 0 }, { skillName: "POO", skillLevel: 0 }, { skillName: "Prototipagem", skillLevel: 0 },
        { skillName: "SOLID", skillLevel: 0 }, { skillName: "Servless", skillLevel: 0 } // Note: "Servless" in JSON, "Serverless" was here
      ]),
      management: JSON.stringify([
        { skillName: "Escrita de Projetos", skillLevel: 0 }, { skillName: "Kanban", skillLevel: 0 },
        { skillName: "Levantamento de Requisitos", skillLevel: 0 }, { skillName: "Metodologia OKR", skillLevel: 0 },
        { skillName: "Scrum", skillLevel: 0 }
      ]),
      security: JSON.stringify([
        { skillName: "Adequação LGPD", skillLevel: 0 }, { skillName: "Análise de Risco", skillLevel: 0 },
        { skillName: "Compliance Geral", skillLevel: 0 }, { skillName: "Criptografia", skillLevel: 0 },
        { skillName: "Governança", skillLevel: 0 }, { skillName: "Hardening", skillLevel: 0 },
        { skillName: "ISA 62.443", skillLevel: 0 }, { skillName: "ISO 22.301", skillLevel: 0 }, { skillName: "ISO 27.001", skillLevel: 0 },
        { skillName: "ISO 27.005", skillLevel: 0 }, { skillName: "ISO 27.701", skillLevel: 0 }, { skillName: "Kali Linux", skillLevel: 0 },
        { skillName: "OWASP ZAP", skillLevel: 0 }, { skillName: "Pentest", skillLevel: 0 }, { skillName: "SI Automação Industrial", skillLevel: 0 },
        { skillName: "Segurança em Código", skillLevel: 0 }, { skillName: "Segurança em Redes", skillLevel: 0 },
        { skillName: "Tissax", skillLevel: 0 }
      ]),
      infra: JSON.stringify([
        { skillName: "Amazon Web Services", skillLevel: 0 }, { skillName: "Apache", skillLevel: 0 }, { skillName: "Apache Kafka", skillLevel: 0 },
        { skillName: "Apache Spark", skillLevel: 0 }, { skillName: "Arduino", skillLevel: 0 }, { skillName: "Azure", skillLevel: 0 },
        { skillName: "Azure DevOps", skillLevel: 0 }, { skillName: "Computação em Nuvem", skillLevel: 0 },
        { skillName: "Configurações de Rede", skillLevel: 0 }, { skillName: "Databricks", skillLevel: 0 },
        { skillName: "Deploy de aplicações", skillLevel: 0 }, { skillName: "DevOps", skillLevel: 0 }, { skillName: "Docker", skillLevel: 0 }, { skillName: "Quarckus", skillLevel: 0 },
        { skillName: "Github Actions", skillLevel: 0 }, { skillName: "Google Cloud Platform", skillLevel: 0 },
        { skillName: "Grafana", skillLevel: 0 }, { skillName: "Hadoop", skillLevel: 0 }, { skillName: "IIS", skillLevel: 0 },
        { skillName: "IoT", skillLevel: 0 }, { skillName: "Jenkins", skillLevel: 0 }, { skillName: "Kubernetes", skillLevel: 0 },
        { skillName: "NGinx", skillLevel: 0 }, { skillName: "Prometheus", skillLevel: 0 }, { skillName: "RabbitMQ", skillLevel: 0 }, { skillName: "Serviços de Mensageria - PUB/SUB", skillLevel: 0 },
        { skillName: "Servidores Linux", skillLevel: 0 },
        { skillName: "Servidores Windows", skillLevel: 0 }, { skillName: "Terraform", skillLevel: 0 }, { skillName: "Websockets", skillLevel: 0 },
        { skillName: "Zabbix", skillLevel: 0 }
      ]),
      data: JSON.stringify([
        { skillName: "Algoritmos Genéticos", skillLevel: 0 }, { skillName: "Amazon Redshift", skillLevel: 0 },
        { skillName: "Análise de Dados", skillLevel: 0 }, { skillName: "Análise exploratória", skillLevel: 0 },
        { skillName: "Automação de Coleta de Dados", skillLevel: 0 }, { skillName: "Azure Synapse Analytics", skillLevel: 0 },
        { skillName: "Data Augmentation", skillLevel: 0 }, { skillName: "Data Lake", skillLevel: 0 }, { skillName: "Data Warehouse", skillLevel: 0 },
        { skillName: "Generative adversarial network (GAN)", skillLevel: 0 }, { skillName: "Google Big Query", skillLevel: 0 },
        { skillName: "Google Colab", skillLevel: 0 }, { skillName: "Hugging Face", skillLevel: 0 }, { skillName: "Jupyter Notebooks", skillLevel: 0 },
        { skillName: "Keras", skillLevel: 0 }, { skillName: "K-Means", skillLevel: 0 }, { skillName: "Langchain", skillLevel: 0 },
        { skillName: "Large Language Modelos - LLMs", skillLevel: 0 }, { skillName: "Linguagem R", skillLevel: 0 },
        { skillName: "Machine Learning", skillLevel: 0 }, { skillName: "Matplotlib", skillLevel: 0 }, { skillName: "MLOps", skillLevel: 0 }, { skillName: "Opencv", skillLevel: 0 },
        { skillName: "Modelos de Classificação", skillLevel: 0 }, { skillName: "Modelos de Regressão Linear", skillLevel: 0 },
        { skillName: "Orange", skillLevel: 0 }, { skillName: "Pandas", skillLevel: 0 },
        { skillName: "Pinecone", skillLevel: 0 }, { skillName: "Pipelines ETL/ELT", skillLevel: 0 }, { skillName: "Power Automate", skillLevel: 0 },
        { skillName: "Power BI", skillLevel: 0 }, { skillName: "Probabilidade e estatística", skillLevel: 0 },
        { skillName: "Processamento de Linguagem Natural (NLP)", skillLevel: 0 }, { skillName: "Redes Neurais Convolucionais(CNN)", skillLevel: 0 },
        { skillName: "Redes Neurais Recorrentes (RNN)", skillLevel: 0 }, { skillName: "RPA", skillLevel: 0 }, { skillName: "Scikit-learn", skillLevel: 0 },
        { skillName: "Seaborn", skillLevel: 0 }, { skillName: "Selenium", skillLevel: 0 }, { skillName: "Tableau", skillLevel: 0 },
        { skillName: "Tensorflow", skillLevel: 0 }, { skillName: "Testes de Hipóteses", skillLevel: 0 }, { skillName: "UiPath", skillLevel: 0 },
        { skillName: "Visão Computacional - Classificação", skillLevel: 0 }, { skillName: "VC - Detecção de Objetos", skillLevel: 0 },
        { skillName: "VC - Reconhecimento de Caracteres (OCR)", skillLevel: 0 }, { skillName: "VC - Segmentação Semântica", skillLevel: 0 },
        { skillName: "Yolo", skillLevel: 0 }
      ]),
      immersive: JSON.stringify([
        { skillName: "Animação", skillLevel: 0 }, { skillName: "Blender", skillLevel: 0 }, { skillName: "Criação de Shadders", skillLevel: 0 },
        { skillName: "Gamificação", skillLevel: 0 }, { skillName: "Gêmeos Digitais", skillLevel: 0 }, { skillName: "Maya", skillLevel: 0 },
        { skillName: "Metaverso", skillLevel: 0 }, { skillName: "Modelagem 3D", skillLevel: 0 }, { skillName: "Rigging", skillLevel: 0 },
        { skillName: "RM", skillLevel: 0 }, { skillName: "Unity", skillLevel: 0 }, { skillName: "Unreal", skillLevel: 0 },
        { skillName: "VA", skillLevel: 0 }, { skillName: "VR", skillLevel: 0 }, { skillName: "Vuforia", skillLevel: 0 }, { skillName: "ZBrush", skillLevel: 0 }
      ]),
      blockchain: JSON.stringify([
        { skillName: "Algoritmos de Criptografia", skillLevel: 0 },
        { skillName: "Protocolos de consenso: PoW, PoS, DPoS", skillLevel: 0 },
        { skillName: "Rastreabilidade", skillLevel: 0 },
        { skillName: "Solidity(Ethereum)", skillLevel: 0 },
        { skillName: "Tokenização (NFTs, DeFi, etc.)", skillLevel: 0 },
        { skillName: "DApps (aplicações descentralizadas)", skillLevel: 0 },
        { skillName: "Hyperledger Fabric", skillLevel: 0 }
      ]),
      marketing: JSON.stringify([
        { skillName: "E-mail Marketing", skillLevel: 0 }, { skillName: "Google ADS", skillLevel: 0 }, { skillName: "Google Analytics", skillLevel: 0 },
        { skillName: "Meta ADS", skillLevel: 0 }, { skillName: "Mídias Digitais", skillLevel: 0 }, { skillName: "Omnichannel", skillLevel: 0 },
        { skillName: "Redes Sociais", skillLevel: 0 }, { skillName: "SEO", skillLevel: 0 },
      ])
    },
    {
      username: "janaina@sp.senai.br", password: "password123", name: "Janaina Falco", fullName: "Janaina Ferreira Falco", unit: "1.27", lastUpdate: new Date().toISOString(),
      backend: JSON.stringify([
        { skillName: ".NET", skillLevel: 0 }, { skillName: "API REST", skillLevel: 0 }, { skillName: "AssertJ", skillLevel: 0 },
        { skillName: "Banco de dados de Grafos", skillLevel: 0 }, { skillName: "C#", skillLevel: 0 }, { skillName: "DBeaver", skillLevel: 0 },
        { skillName: "Entity Framework", skillLevel: 0 }, { skillName: "Express", skillLevel: 0 }, { skillName: "Fastify", skillLevel: 0 },
        { skillName: "Gerenciamento de Banco de Dados", skillLevel: 0 }, { skillName: "Java", skillLevel: 0 }, { skillName: "MongoDB", skillLevel: 0 },
        { skillName: "MySQL", skillLevel: 0 }, { skillName: "Node.js", skillLevel: 0 }, { skillName: "Oracle", skillLevel: 0 },
        { skillName: "PHP", skillLevel: 0 }, { skillName: "PostgreSQL", skillLevel: 0 }, { skillName: "Python", skillLevel: 0 },
        { skillName: "Redis", skillLevel: 0 }, { skillName: "Spring Boot", skillLevel: 0 }, { skillName: "Spring Data", skillLevel: 0 },
        { skillName: "Spring JPA", skillLevel: 0 }, { skillName: "SQL Server", skillLevel: 0 }, { skillName: "SQLite", skillLevel: 0 },
        { skillName: "Swagger", skillLevel: 0 }, { skillName: "Xunit", skillLevel: 0 }, { skillName: "NestJS", skillLevel: 0 },
        { skillName: "Quarckus", skillLevel: 0 }
      ]),
      frontend: JSON.stringify([
        { skillName: "Angular", skillLevel: 0 }, { skillName: "Axios", skillLevel: 0 }, { skillName: "Bootstrap", skillLevel: 0 },
        { skillName: "Context API", skillLevel: 0 }, { skillName: "CSS", skillLevel: 0 }, { skillName: "Cypress", skillLevel: 0 },
        { skillName: "Design Responsivo", skillLevel: 0 }, { skillName: "HTML", skillLevel: 0 }, { skillName: "Insomnia", skillLevel: 0 },
        { skillName: "JavaScript", skillLevel: 0 }, { skillName: "Jest", skillLevel: 0 }, { skillName: "Materialize", skillLevel: 0 },
        { skillName: "Next.js", skillLevel: 0 }, { skillName: "React Hook Form", skillLevel: 0 }, { skillName: "React Query", skillLevel: 0 },
        { skillName: "Redux", skillLevel: 0 }, { skillName: "Styled-components", skillLevel: 0 },
        { skillName: "React", skillLevel: 0 }, { skillName: "Tailwind CSS", skillLevel: 0 }, { skillName: "TypeScript", skillLevel: 0 },
        { skillName: "StoryBook", skillLevel: 0 }, { skillName: "UI", skillLevel: 0 }, { skillName: "UX", skillLevel: 0 }
      ]),
      mobile: JSON.stringify([
        { skillName: "Dart", skillLevel: 0 }, { skillName: "Desenvolvimento Smart TV", skillLevel: 0 },
        { skillName: "Desenvolvimento Smart Watch", skillLevel: 0 }, { skillName: "Electron", skillLevel: 0 },
        { skillName: "Flutter", skillLevel: 0 }, { skillName: "Kotlin", skillLevel: 0 },
        { skillName: "Publicação em Apple Store", skillLevel: 0 }, { skillName: "Publicação em Play Store", skillLevel: 0 },
        { skillName: "React Native", skillLevel: 0 }, { skillName: "Swift", skillLevel: 0 }
      ]),
      architecture: JSON.stringify([
        { skillName: "Aplicações Monolíticas", skillLevel: 0 }, { skillName: "Clean Code", skillLevel: 0 },
        { skillName: "Codereview", skillLevel: 0 }, { skillName: "Design Patterns", skillLevel: 0 },
        { skillName: "Design System", skillLevel: 0 }, { skillName: "Design Thinking", skillLevel: 0 },
        { skillName: "Documentação de Software", skillLevel: 0 }, { skillName: "Figma", skillLevel: 0 },
        { skillName: "Firebase", skillLevel: 0 }, { skillName: "Git", skillLevel: 0 }, { skillName: "GitHub", skillLevel: 0 },
        { skillName: "Microserviços", skillLevel: 0 }, { skillName: "POO", skillLevel: 0 }, { skillName: "Prototipagem", skillLevel: 0 },
        { skillName: "SOLID", skillLevel: 0 }, { skillName: "Servless", skillLevel: 0 }
      ]),
      management: JSON.stringify([
        { skillName: "Escrita de Projetos", skillLevel: 0 }, { skillName: "Kanban", skillLevel: 0 },
        { skillName: "Levantamento de Requisitos", skillLevel: 0 }, { skillName: "Metodologia OKR", skillLevel: 0 },
        { skillName: "Scrum", skillLevel: 0 }
      ]),
      security: JSON.stringify([
        { skillName: "Adequação LGPD", skillLevel: 0 }, { skillName: "Análise de Risco", skillLevel: 0 },
        { skillName: "Compliance Geral", skillLevel: 0 }, { skillName: "Criptografia", skillLevel: 0 },
        { skillName: "Governança", skillLevel: 0 }, { skillName: "Hardening", skillLevel: 0 },
        { skillName: "ISA 62.443", skillLevel: 0 }, { skillName: "ISO 22.301", skillLevel: 0 }, { skillName: "ISO 27.001", skillLevel: 0 },
        { skillName: "ISO 27.005", skillLevel: 0 }, { skillName: "ISO 27.701", skillLevel: 0 }, { skillName: "Kali Linux", skillLevel: 0 },
        { skillName: "OWASP ZAP", skillLevel: 0 }, { skillName: "Pentest", skillLevel: 0 }, { skillName: "SI Automação Industrial", skillLevel: 0 },
        { skillName: "Segurança em Código", skillLevel: 0 }, { skillName: "Segurança em Redes", skillLevel: 0 },
        { skillName: "Tissax", skillLevel: 0 }
      ]),
      infra: JSON.stringify([
        { skillName: "Amazon Web Services", skillLevel: 0 }, { skillName: "Apache", skillLevel: 0 }, { skillName: "Apache Kafka", skillLevel: 0 },
        { skillName: "Apache Spark", skillLevel: 0 }, { skillName: "Arduino", skillLevel: 0 }, { skillName: "Azure", skillLevel: 0 },
        { skillName: "Azure DevOps", skillLevel: 0 }, { skillName: "Computação em Nuvem", skillLevel: 0 },
        { skillName: "Configurações de Rede", skillLevel: 0 }, { skillName: "Databricks", skillLevel: 0 },
        { skillName: "Deploy de aplicações", skillLevel: 0 }, { skillName: "DevOps", skillLevel: 0 }, { skillName: "Docker", skillLevel: 0 }, { skillName: "Quarckus", skillLevel: 0 },
        { skillName: "Github Actions", skillLevel: 0 }, { skillName: "Google Cloud Platform", skillLevel: 0 },
        { skillName: "Grafana", skillLevel: 0 }, { skillName: "Hadoop", skillLevel: 0 }, { skillName: "IIS", skillLevel: 0 },
        { skillName: "IoT", skillLevel: 0 }, { skillName: "Jenkins", skillLevel: 0 }, { skillName: "Kubernetes", skillLevel: 0 },
        { skillName: "NGinx", skillLevel: 0 }, { skillName: "Prometheus", skillLevel: 0 }, { skillName: "RabbitMQ", skillLevel: 0 }, { skillName: "Serviços de Mensageria - PUB/SUB", skillLevel: 0 },
        { skillName: "Servidores Linux", skillLevel: 0 },
        { skillName: "Servidores Windows", skillLevel: 0 }, { skillName: "Terraform", skillLevel: 0 }, { skillName: "Websockets", skillLevel: 0 },
        { skillName: "Zabbix", skillLevel: 0 }
      ]),
      data: JSON.stringify([
        { skillName: "Algoritmos Genéticos", skillLevel: 0 }, { skillName: "Amazon Redshift", skillLevel: 0 },
        { skillName: "Análise de Dados", skillLevel: 0 }, { skillName: "Análise exploratória", skillLevel: 0 },
        { skillName: "Automação de Coleta de Dados", skillLevel: 0 }, { skillName: "Azure Synapse Analytics", skillLevel: 0 },
        { skillName: "Data Augmentation", skillLevel: 0 }, { skillName: "Data Lake", skillLevel: 0 }, { skillName: "Data Warehouse", skillLevel: 0 },
        { skillName: "Generative adversarial network (GAN)", skillLevel: 0 }, { skillName: "Google Big Query", skillLevel: 0 },
        { skillName: "Google Colab", skillLevel: 0 }, { skillName: "Hugging Face", skillLevel: 0 }, { skillName: "Jupyter Notebooks", skillLevel: 0 },
        { skillName: "Keras", skillLevel: 0 }, { skillName: "K-Means", skillLevel: 0 }, { skillName: "Langchain", skillLevel: 0 },
        { skillName: "Large Language Modelos - LLMs", skillLevel: 0 }, { skillName: "Linguagem R", skillLevel: 0 },
        { skillName: "Machine Learning", skillLevel: 0 }, { skillName: "Matplotlib", skillLevel: 0 }, { skillName: "MLOps", skillLevel: 0 }, { skillName: "Opencv", skillLevel: 0 },
        { skillName: "Modelos de Classificação", skillLevel: 0 }, { skillName: "Modelos de Regressão Linear", skillLevel: 0 },
        { skillName: "Orange", skillLevel: 0 }, { skillName: "Pandas", skillLevel: 0 },
        { skillName: "Pinecone", skillLevel: 0 }, { skillName: "Pipelines ETL/ELT", skillLevel: 0 }, { skillName: "Power Automate", skillLevel: 0 },
        { skillName: "Power BI", skillLevel: 0 }, { skillName: "Probabilidade e estatística", skillLevel: 0 },
        { skillName: "Processamento de Linguagem Natural (NLP)", skillLevel: 0 }, { skillName: "Redes Neurais Convolucionais(CNN)", skillLevel: 0 },
        { skillName: "Redes Neurais Recorrentes (RNN)", skillLevel: 0 }, { skillName: "RPA", skillLevel: 0 }, { skillName: "Scikit-learn", skillLevel: 0 },
        { skillName: "Seaborn", skillLevel: 0 }, { skillName: "Selenium", skillLevel: 0 }, { skillName: "Tableau", skillLevel: 0 },
        { skillName: "Tensorflow", skillLevel: 0 }, { skillName: "Testes de Hipóteses", skillLevel: 0 }, { skillName: "UiPath", skillLevel: 0 },
        { skillName: "Visão Computacional - Classificação", skillLevel: 0 }, { skillName: "VC - Detecção de Objetos", skillLevel: 0 },
        { skillName: "VC - Reconhecimento de Caracteres (OCR)", skillLevel: 0 }, { skillName: "VC - Segmentação Semântica", skillLevel: 0 },
        { skillName: "Yolo", skillLevel: 0 }
      ]),
      immersive: JSON.stringify([
        { skillName: "Animação", skillLevel: 0 }, { skillName: "Blender", skillLevel: 0 }, { skillName: "Criação de Shadders", skillLevel: 0 },
        { skillName: "Gamificação", skillLevel: 0 }, { skillName: "Gêmeos Digitais", skillLevel: 0 }, { skillName: "Maya", skillLevel: 0 },
        { skillName: "Metaverso", skillLevel: 0 }, { skillName: "Modelagem 3D", skillLevel: 0 }, { skillName: "Rigging", skillLevel: 0 },
        { skillName: "RM", skillLevel: 0 }, { skillName: "Unity", skillLevel: 0 }, { skillName: "Unreal", skillLevel: 0 },
        { skillName: "VA", skillLevel: 0 }, { skillName: "VR", skillLevel: 0 }, { skillName: "Vuforia", skillLevel: 0 }, { skillName: "ZBrush", skillLevel: 0 }
      ]),
      blockchain: JSON.stringify([
        { skillName: "Algoritmos de Criptografia", skillLevel: 0 },
        { skillName: "Protocolos de consenso: PoW, PoS, DPoS", skillLevel: 0 },
        { skillName: "Rastreabilidade", skillLevel: 0 },
        { skillName: "Solidity(Ethereum)", skillLevel: 0 },
        { skillName: "Tokenização (NFTs, DeFi, etc.)", skillLevel: 0 },
        { skillName: "DApps (aplicações descentralizadas)", skillLevel: 0 },
        { skillName: "Hyperledger Fabric", skillLevel: 0 }
      ]),
      marketing: JSON.stringify([
        { skillName: "E-mail Marketing", skillLevel: 0 }, { skillName: "Google ADS", skillLevel: 0 }, { skillName: "Google Analytics", skillLevel: 0 },
        { skillName: "Meta ADS", skillLevel: 0 }, { skillName: "Mídias Digitais", skillLevel: 0 }, { skillName: "Omnichannel", skillLevel: 0 },
        { skillName: "Redes Sociais", skillLevel: 0 }, { skillName: "SEO", skillLevel: 0 },
      ])
    },
    {
      username: "admin@sp.senai.br", password: "adminpassword", name: "Admin", fullName: "System Administrator", unit: "1.27", lastUpdate: new Date().toISOString(),
      backend: JSON.stringify([
        { skillName: ".NET", skillLevel: 0 }, { skillName: "API REST", skillLevel: 0 }, { skillName: "AssertJ", skillLevel: 0 },
        { skillName: "Banco de dados de Grafos", skillLevel: 0 }, { skillName: "C#", skillLevel: 0 }, { skillName: "DBeaver", skillLevel: 0 },
        { skillName: "Entity Framework", skillLevel: 0 }, { skillName: "Express", skillLevel: 0 }, { skillName: "Fastify", skillLevel: 0 },
        { skillName: "Gerenciamento de Banco de Dados", skillLevel: 0 }, { skillName: "Java", skillLevel: 0 }, { skillName: "MongoDB", skillLevel: 0 },
        { skillName: "MySQL", skillLevel: 0 }, { skillName: "Node.js", skillLevel: 0 }, { skillName: "Oracle", skillLevel: 0 },
        { skillName: "PHP", skillLevel: 0 }, { skillName: "PostgreSQL", skillLevel: 0 }, { skillName: "Python", skillLevel: 0 },
        { skillName: "Redis", skillLevel: 0 }, { skillName: "Spring Boot", skillLevel: 0 }, { skillName: "Spring Data", skillLevel: 0 },
        { skillName: "Spring JPA", skillLevel: 0 }, { skillName: "SQL Server", skillLevel: 0 }, { skillName: "SQLite", skillLevel: 0 },
        { skillName: "Swagger", skillLevel: 0 }, { skillName: "Xunit", skillLevel: 0 }, { skillName: "NestJS", skillLevel: 0 },
        { skillName: "Quarckus", skillLevel: 0 }
      ]),
      frontend: JSON.stringify([
        { skillName: "Angular", skillLevel: 0 }, { skillName: "Axios", skillLevel: 0 }, { skillName: "Bootstrap", skillLevel: 0 },
        { skillName: "Context API", skillLevel: 0 }, { skillName: "CSS", skillLevel: 0 }, { skillName: "Cypress", skillLevel: 0 },
        { skillName: "Design Responsivo", skillLevel: 0 }, { skillName: "HTML", skillLevel: 0 }, { skillName: "Insomnia", skillLevel: 0 },
        { skillName: "JavaScript", skillLevel: 0 }, { skillName: "Jest", skillLevel: 0 }, { skillName: "Materialize", skillLevel: 0 },
        { skillName: "Next.js", skillLevel: 0 }, { skillName: "React Hook Form", skillLevel: 0 }, { skillName: "React Query", skillLevel: 0 },
        { skillName: "Redux", skillLevel: 0 }, { skillName: "Styled-components", skillLevel: 0 },
        { skillName: "React", skillLevel: 0 }, { skillName: "Tailwind CSS", skillLevel: 0 }, { skillName: "TypeScript", skillLevel: 0 },
        { skillName: "StoryBook", skillLevel: 0 }, { skillName: "UI", skillLevel: 0 }, { skillName: "UX", skillLevel: 0 }
      ]),
      mobile: JSON.stringify([
        { skillName: "Dart", skillLevel: 0 }, { skillName: "Desenvolvimento Smart TV", skillLevel: 0 },
        { skillName: "Desenvolvimento Smart Watch", skillLevel: 0 }, { skillName: "Electron", skillLevel: 0 },
        { skillName: "Flutter", skillLevel: 0 }, { skillName: "Kotlin", skillLevel: 0 },
        { skillName: "Publicação em Apple Store", skillLevel: 0 }, { skillName: "Publicação em Play Store", skillLevel: 0 },
        { skillName: "React Native", skillLevel: 0 }, { skillName: "Swift", skillLevel: 0 }
      ]),
      architecture: JSON.stringify([
        { skillName: "Aplicações Monolíticas", skillLevel: 0 }, { skillName: "Clean Code", skillLevel: 0 },
        { skillName: "Codereview", skillLevel: 0 }, { skillName: "Design Patterns", skillLevel: 0 },
        { skillName: "Design System", skillLevel: 0 }, { skillName: "Design Thinking", skillLevel: 0 },
        { skillName: "Documentação de Software", skillLevel: 0 }, { skillName: "Figma", skillLevel: 0 },
        { skillName: "Firebase", skillLevel: 0 }, { skillName: "Git", skillLevel: 0 }, { skillName: "GitHub", skillLevel: 0 },
        { skillName: "Microserviços", skillLevel: 0 }, { skillName: "POO", skillLevel: 0 }, { skillName: "Prototipagem", skillLevel: 0 },
        { skillName: "SOLID", skillLevel: 0 }, { skillName: "Servless", skillLevel: 0 }
      ]),
      management: JSON.stringify([
        { skillName: "Escrita de Projetos", skillLevel: 0 }, { skillName: "Kanban", skillLevel: 0 },
        { skillName: "Levantamento de Requisitos", skillLevel: 0 }, { skillName: "Metodologia OKR", skillLevel: 0 },
        { skillName: "Scrum", skillLevel: 0 }
      ]),
      security: JSON.stringify([
        { skillName: "Adequação LGPD", skillLevel: 0 }, { skillName: "Análise de Risco", skillLevel: 0 },
        { skillName: "Compliance Geral", skillLevel: 0 }, { skillName: "Criptografia", skillLevel: 0 },
        { skillName: "Governança", skillLevel: 0 }, { skillName: "Hardening", skillLevel: 0 },
        { skillName: "ISA 62.443", skillLevel: 0 }, { skillName: "ISO 22.301", skillLevel: 0 }, { skillName: "ISO 27.001", skillLevel: 0 },
        { skillName: "ISO 27.005", skillLevel: 0 }, { skillName: "ISO 27.701", skillLevel: 0 }, { skillName: "Kali Linux", skillLevel: 0 },
        { skillName: "OWASP ZAP", skillLevel: 0 }, { skillName: "Pentest", skillLevel: 0 }, { skillName: "SI Automação Industrial", skillLevel: 0 },
        { skillName: "Segurança em Código", skillLevel: 0 }, { skillName: "Segurança em Redes", skillLevel: 0 },
        { skillName: "Tissax", skillLevel: 0 }
      ]),
      infra: JSON.stringify([
        { skillName: "Amazon Web Services", skillLevel: 0 }, { skillName: "Apache", skillLevel: 0 }, { skillName: "Apache Kafka", skillLevel: 0 },
        { skillName: "Apache Spark", skillLevel: 0 }, { skillName: "Arduino", skillLevel: 0 }, { skillName: "Azure", skillLevel: 0 },
        { skillName: "Azure DevOps", skillLevel: 0 }, { skillName: "Computação em Nuvem", skillLevel: 0 },
        { skillName: "Configurações de Rede", skillLevel: 0 }, { skillName: "Databricks", skillLevel: 0 },
        { skillName: "Deploy de aplicações", skillLevel: 0 }, { skillName: "DevOps", skillLevel: 0 }, { skillName: "Docker", skillLevel: 0 }, { skillName: "Quarckus", skillLevel: 0 },
        { skillName: "Github Actions", skillLevel: 0 }, { skillName: "Google Cloud Platform", skillLevel: 0 },
        { skillName: "Grafana", skillLevel: 0 }, { skillName: "Hadoop", skillLevel: 0 }, { skillName: "IIS", skillLevel: 0 },
        { skillName: "IoT", skillLevel: 0 }, { skillName: "Jenkins", skillLevel: 0 }, { skillName: "Kubernetes", skillLevel: 0 },
        { skillName: "NGinx", skillLevel: 0 }, { skillName: "Prometheus", skillLevel: 0 }, { skillName: "RabbitMQ", skillLevel: 0 }, { skillName: "Serviços de Mensageria - PUB/SUB", skillLevel: 0 },
        { skillName: "Servidores Linux", skillLevel: 0 },
        { skillName: "Servidores Windows", skillLevel: 0 }, { skillName: "Terraform", skillLevel: 0 }, { skillName: "Websockets", skillLevel: 0 },
        { skillName: "Zabbix", skillLevel: 0 }
      ]),
      data: JSON.stringify([
        { skillName: "Algoritmos Genéticos", skillLevel: 0 }, { skillName: "Amazon Redshift", skillLevel: 0 },
        { skillName: "Análise de Dados", skillLevel: 0 }, { skillName: "Análise exploratória", skillLevel: 0 },
        { skillName: "Automação de Coleta de Dados", skillLevel: 0 }, { skillName: "Azure Synapse Analytics", skillLevel: 0 },
        { skillName: "Data Augmentation", skillLevel: 0 }, { skillName: "Data Lake", skillLevel: 0 }, { skillName: "Data Warehouse", skillLevel: 0 },
        { skillName: "Generative adversarial network (GAN)", skillLevel: 0 }, { skillName: "Google Big Query", skillLevel: 0 },
        { skillName: "Google Colab", skillLevel: 0 }, { skillName: "Hugging Face", skillLevel: 0 }, { skillName: "Jupyter Notebooks", skillLevel: 0 },
        { skillName: "Keras", skillLevel: 0 }, { skillName: "K-Means", skillLevel: 0 }, { skillName: "Langchain", skillLevel: 0 },
        { skillName: "Large Language Modelos - LLMs", skillLevel: 0 }, { skillName: "Linguagem R", skillLevel: 0 },
        { skillName: "Machine Learning", skillLevel: 0 }, { skillName: "Matplotlib", skillLevel: 0 }, { skillName: "MLOps", skillLevel: 0 }, { skillName: "Opencv", skillLevel: 0 },
        { skillName: "Modelos de Classificação", skillLevel: 0 }, { skillName: "Modelos de Regressão Linear", skillLevel: 0 },
        { skillName: "Orange", skillLevel: 0 }, { skillName: "Pandas", skillLevel: 0 },
        { skillName: "Pinecone", skillLevel: 0 }, { skillName: "Pipelines ETL/ELT", skillLevel: 0 }, { skillName: "Power Automate", skillLevel: 0 },
        { skillName: "Power BI", skillLevel: 0 }, { skillName: "Probabilidade e estatística", skillLevel: 0 },
        { skillName: "Processamento de Linguagem Natural (NLP)", skillLevel: 0 }, { skillName: "Redes Neurais Convolucionais(CNN)", skillLevel: 0 },
        { skillName: "Redes Neurais Recorrentes (RNN)", skillLevel: 0 }, { skillName: "RPA", skillLevel: 0 }, { skillName: "Scikit-learn", skillLevel: 0 },
        { skillName: "Seaborn", skillLevel: 0 }, { skillName: "Selenium", skillLevel: 0 }, { skillName: "Tableau", skillLevel: 0 },
        { skillName: "Tensorflow", skillLevel: 0 }, { skillName: "Testes de Hipóteses", skillLevel: 0 }, { skillName: "UiPath", skillLevel: 0 },
        { skillName: "Visão Computacional - Classificação", skillLevel: 0 }, { skillName: "VC - Detecção de Objetos", skillLevel: 0 },
        { skillName: "VC - Reconhecimento de Caracteres (OCR)", skillLevel: 0 }, { skillName: "VC - Segmentação Semântica", skillLevel: 0 },
        { skillName: "Yolo", skillLevel: 0 }
      ]),
      immersive: JSON.stringify([
        { skillName: "Animação", skillLevel: 0 }, { skillName: "Blender", skillLevel: 0 }, { skillName: "Criação de Shadders", skillLevel: 0 },
        { skillName: "Gamificação", skillLevel: 0 }, { skillName: "Gêmeos Digitais", skillLevel: 0 }, { skillName: "Maya", skillLevel: 0 },
        { skillName: "Metaverso", skillLevel: 0 }, { skillName: "Modelagem 3D", skillLevel: 0 }, { skillName: "Rigging", skillLevel: 0 },
        { skillName: "RM", skillLevel: 0 }, { skillName: "Unity", skillLevel: 0 }, { skillName: "Unreal", skillLevel: 0 },
        { skillName: "VA", skillLevel: 0 }, { skillName: "VR", skillLevel: 0 }, { skillName: "Vuforia", skillLevel: 0 }, { skillName: "ZBrush", skillLevel: 0 }
      ]),
      blockchain: JSON.stringify([
        { skillName: "Algoritmos de Criptografia", skillLevel: 0 },
        { skillName: "Protocolos de consenso: PoW, PoS, DPoS", skillLevel: 0 },
        { skillName: "Rastreabilidade", skillLevel: 0 },
        { skillName: "Solidity(Ethereum)", skillLevel: 0 },
        { skillName: "Tokenização (NFTs, DeFi, etc.)", skillLevel: 0 },
        { skillName: "DApps (aplicações descentralizadas)", skillLevel: 0 },
        { skillName: "Hyperledger Fabric", skillLevel: 0 }
      ]),
      marketing: JSON.stringify([
        { skillName: "E-mail Marketing", skillLevel: 0 }, { skillName: "Google ADS", skillLevel: 0 }, { skillName: "Google Analytics", skillLevel: 0 },
        { skillName: "Meta ADS", skillLevel: 0 }, { skillName: "Mídias Digitais", skillLevel: 0 }, { skillName: "Omnichannel", skillLevel: 0 },
        { skillName: "Redes Sociais", skillLevel: 0 }, { skillName: "SEO", skillLevel: 0 },
      ])
    }
  ];

  let allSkillCategories;
  try {
    allSkillCategories = require('./skillCategories.json');
    console.log("[PostgresClient] skillCategories.json carregado para popular novos usuários.");
  } catch (e) {
    console.error("[PostgresClient] ERRO: Não foi possível carregar './skillCategories.json' para popular novos usuários. Usando arrays vazios como fallback.", e.message);
    // Fallback para arrays vazios se o JSON não puder ser carregado, para evitar que a inicialização quebre.
    // No entanto, isso significaria que os novos usuários não teriam a estrutura de skills.
    // O ideal é garantir que skillCategories.json sempre exista e seja válido.    
    allSkillCategories = {};
    Object.values(SKILL_CATEGORIES_JSON_KEYS).forEach(jsonKey => {
      allSkillCategories[jsonKey] = [];
    });
  };

  const newUsersList = [
    { usernameBase: "bruno.fernandes", name: "Bruno", fullName: "Bruno Henrique Fernandes" },
    { usernameBase: "christian.alonso", name: "Christian", fullName: "Christian Albuquerque Alonso" },
    { usernameBase: "daniel.santos", name: "Daniel", fullName: "Daniel Wilson Alves dos Santos" },
    { usernameBase: "erick.barbosa", name: "Erick", fullName: "Erick Araujo Barbosa" },
    { usernameBase: "flavio.dias", name: "Flávio", fullName: "Flávio Camilo Dias" },
    { usernameBase: "joao.meyer", name: "João", fullName: "João Henrique Parizoti Meyer" },
    { usernameBase: "lucas.silva", name: "Lucas", fullName: "Lucas Araujo Oliveira Silva" },
    { usernameBase: "lukas.venancio", name: "Lukas", fullName: "Lukas Santos Venâncio" },
    { usernameBase: "pedro.santos", name: "Pedro", fullName: "Pedro Henrique Silva Santos" },
    { usernameBase: "raphael.nascimento", name: "Raphael", fullName: "Raphael Lima Marques do Nascimento" },
    { usernameBase: "rodrigo.silva", name: "Rodrigo", fullName: "Rodrigo Areias da Silva" },
    { usernameBase: "rogger.silveira", name: "Rogger", fullName: "Rogger da Silva Silveira" },
    { usernameBase: "wesley.meneghini", name: "Wesley", fullName: "Wesley Meneghini" },
    { usernameBase: "wilson.carneiro", name: "Wilson", fullName: "Wilson Rogerio Carneiro" }
  ];

  newUsersList.forEach(u => {
    initialUsers.push({
      username: `${u.usernameBase}@sp.senai.br`,
      password: "password123",
      name: u.name,
      fullName: u.fullName,
      unit: "1.27", // Definindo a unidade para 1.27 para todos os novos usuários
      lastUpdate: new Date().toISOString(),
      backend: JSON.stringify(allSkillCategories[SKILL_CATEGORIES_JSON_KEYS.backend] || []),
      frontend: JSON.stringify(allSkillCategories[SKILL_CATEGORIES_JSON_KEYS.frontend] || []),
      mobile: JSON.stringify(allSkillCategories[SKILL_CATEGORIES_JSON_KEYS.mobile] || []),
      architecture: JSON.stringify(allSkillCategories[SKILL_CATEGORIES_JSON_KEYS.architecture] || []),
      management: JSON.stringify(allSkillCategories[SKILL_CATEGORIES_JSON_KEYS.management] || []),
      security: JSON.stringify(allSkillCategories[SKILL_CATEGORIES_JSON_KEYS.security] || []),
      infra: JSON.stringify(allSkillCategories[SKILL_CATEGORIES_JSON_KEYS.infra] || []),
      data: JSON.stringify(allSkillCategories[SKILL_CATEGORIES_JSON_KEYS.data] || []),
      immersive: JSON.stringify(allSkillCategories[SKILL_CATEGORIES_JSON_KEYS.immersive] || []),
      marketing: JSON.stringify(allSkillCategories[SKILL_CATEGORIES_JSON_KEYS.marketing] || []),
      blockchain: JSON.stringify(allSkillCategories[SKILL_CATEGORIES_JSON_KEYS.blockchain] || [])
    });
  });

  for (const user of initialUsers) {
    const hash = await bcrypt.hash(user.password, 10);
    const values = [
      user.username, hash, user.name, user.fullName, user.unit, user.lastUpdate,
      user.backend, user.frontend, user.mobile, user.architecture,
      user.management, user.security, user.infra, user.data,
      user.immersive, user.marketing, user.blockchain
    ];

    await pool.query(
      `INSERT INTO users (
        username, password_hash, name, "fullName", unit, lastUpdate,
        backend, frontend, mobile, architecture, management,
        security, infra, data, immersive, marketing, blockchain
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7::jsonb, $8::jsonb, $9::jsonb, $10::jsonb, $11::jsonb,
        $12::jsonb, $13::jsonb, $14::jsonb, $15::jsonb, $16::jsonb, $17::jsonb
      ) ON CONFLICT (username) DO NOTHING`,
      values
    );
    console.log("Usuário inserido/ignorado (via insertInitialData):", user.username);
  }
}

async function initializeDatabase() {
  try {
    console.log('Conectando ao banco de dados PostgreSQL...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name VARCHAR(255) NOT NULL,        -- Mantido como lowercase, pois o código JS parece usar user.name
        "fullName" VARCHAR(255) NOT NULL,  -- Citado para preservar o case
        unit VARCHAR(255) NOT NULL,        -- Mantido como lowercase
        lastUpdate TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        backend JSONB DEFAULT '[]',
        frontend JSONB DEFAULT '[]',
        mobile JSONB DEFAULT '[]',
        architecture JSONB DEFAULT '[]',
        management JSONB DEFAULT '[]',
        security JSONB DEFAULT '[]',
        infra JSONB DEFAULT '[]',
        data JSONB DEFAULT '[]',
        immersive JSONB DEFAULT '[]',
        marketing JSONB DEFAULT '[]',
        blockchain JSONB DEFAULT '[]'
      );
    `);

    console.log("Tabela 'users' verificada/criada no PostgreSQL.");

    // Chama a nova função para inserir os dados iniciais
    await insertInitialData(pool);

    console.log('Inicialização do banco de dados PostgreSQL concluída.');
  } catch (err) {
    console.error('Erro durante a inicialização do banco de dados PostgreSQL:', err);
  }
}

initializeDatabase().catch(err => {
  console.error("Falha crítica ao inicializar o banco de dados PostgreSQL:", err);
});

module.exports = pool;