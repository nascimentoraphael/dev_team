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

async function insertInitialData(pool) {
  const initialUsers = [
    {
      username: "italo@senai.br", password: "password123", name: "Italo Ignacio", fullName: "Italo Felipe Ignacio", unit: "Sede", lastUpdate: new Date().toISOString(),
      backend: JSON.stringify([
        { skillName: ".NET", skillLevel: 0 }, { skillName: "API REST", skillLevel: 0 }, { skillName: "AssertJ", skillLevel: 0 },
        { skillName: "Banco de Dados de Grafos", skillLevel: 0 }, { skillName: "C#", skillLevel: 0 }, { skillName: "Dbeaver", skillLevel: 0 },
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
        { skillName: "Next.js", skillLevel: 0 }, { skillName: "React Hook Form", skillLevel: 0 }, { skillName: "Redux", skillLevel: 0 },
        { skillName: "React", skillLevel: 0 }, { skillName: "Tailwind CSS", skillLevel: 0 }, { skillName: "TypeScript", skillLevel: 0 },
        { skillName: "StoryBook", skillLevel: 0 }, { skillName: "UI", skillLevel: 0 }, { skillName: "UX", skillLevel: 0 }
      ]),
      mobile: JSON.stringify([
        { skillName: "Dart", skillLevel: 0 }, { skillName: "Desenvolvimento Smart TV", skillLevel: 0 },
        { skillName: "Desenvolvimento Smart Watch", skillLevel: 0 }, { skillName: "Electron", skillLevel: 0 },
        { skillName: "Flutter", skillLevel: 0 }, { skillName: "Kotlin", skillLevel: 0 },
        { skillName: "Publicação Apple Store", skillLevel: 0 }, { skillName: "Publicação Play Store", skillLevel: 0 },
        { skillName: "React Native", skillLevel: 0 }, { skillName: "Swift", skillLevel: 0 }
      ]),
      architecture: JSON.stringify([
        { skillName: "Aplicações Monolíticas", skillLevel: 0 }, { skillName: "Clean Code", skillLevel: 0 },
        { skillName: "Codereview", skillLevel: 0 }, { skillName: "Design Patterns", skillLevel: 0 },
        { skillName: "Design System", skillLevel: 0 }, { skillName: "Design Thinking", skillLevel: 0 },
        { skillName: "Documentação de Software", skillLevel: 0 }, { skillName: "Figma", skillLevel: 0 },
        { skillName: "Firebase", skillLevel: 0 }, { skillName: "Git", skillLevel: 0 }, { skillName: "GitHub", skillLevel: 0 },
        { skillName: "Microserviços", skillLevel: 0 }, { skillName: "POO", skillLevel: 0 },
        { skillName: "Prototipagem", skillLevel: 0 }, { skillName: "Serverless", skillLevel: 0 }, { skillName: "SOLID", skillLevel: 0 }
      ]),
      management: JSON.stringify([
        { skillName: "Scrum", skillLevel: 0 }, { skillName: "Kanban", skillLevel: 0 }
      ]),
      security: JSON.stringify([
        { skillName: "Adequação LGPD", skillLevel: 0 }, { skillName: "Análise de Risco", skillLevel: 0 },
        { skillName: "Compliance Geral", skillLevel: 0 }, { skillName: "Criptografia", skillLevel: 0 },
        { skillName: "Governança", skillLevel: 0 }, { skillName: "Hardening", skillLevel: 0 },
        { skillName: "ISA 62.443 (IEC 62443)", skillLevel: 0 }, { skillName: "ISO 22301 (Continuidade de Negócios)", skillLevel: 0 },
        { skillName: "ISO 27001", skillLevel: 0 }, { skillName: "ISO 27005 (Gestão de Riscos)", skillLevel: 0 },
        { skillName: "ISO 27701 (Privacidade/LGPD)", skillLevel: 0 }, { skillName: "Kali Linux", skillLevel: 0 },
        { skillName: "OWASP ZAP", skillLevel: 0 }, { skillName: "Pentest", skillLevel: 0 },
        { skillName: "Segurança da Informação em Automação Industrial", skillLevel: 0 },
        { skillName: "Segurança em Código (Security by Design)", skillLevel: 0 }, { skillName: "Segurança em Redes", skillLevel: 0 },
        { skillName: "TISAX (Automotivo)", skillLevel: 0 }
      ]),
      infra: JSON.stringify([
        { skillName: "Amazon Web Services", skillLevel: 0 }, { skillName: "Apache", skillLevel: 0 }, { skillName: "Apache Kafka", skillLevel: 0 },
        { skillName: "Apache Spark", skillLevel: 0 }, { skillName: "Arduino", skillLevel: 0 }, { skillName: "Azure", skillLevel: 0 },
        { skillName: "Azure DevOps", skillLevel: 0 }, { skillName: "Computação em Nuvem", skillLevel: 0 },
        { skillName: "Configurações de Rede", skillLevel: 0 }, { skillName: "Databricks", skillLevel: 0 },
        { skillName: "Deploy de aplicações", skillLevel: 0 }, { skillName: "DevOps", skillLevel: 0 }, { skillName: "Docker", skillLevel: 0 },
        { skillName: "Github Actions", skillLevel: 0 }, { skillName: "Google Cloud Platform", skillLevel: 0 },
        { skillName: "Grafana", skillLevel: 0 }, { skillName: "Hadoop", skillLevel: 0 }, { skillName: "IIS", skillLevel: 0 },
        { skillName: "IoT", skillLevel: 0 }, { skillName: "Jenkins", skillLevel: 0 }, { skillName: "Kubernetes", skillLevel: 0 },
        { skillName: "NGinx", skillLevel: 0 }, { skillName: "Prometheus", skillLevel: 0 }, { skillName: "RabbitMQ", skillLevel: 0 },
        { skillName: "Serviços de Mensageria PUB/SUB", skillLevel: 0 }, { skillName: "Servidores Linux", skillLevel: 0 },
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
        { skillName: "Machine Learning", skillLevel: 0 }, { skillName: "Matplotlib", skillLevel: 0 }, { skillName: "MLOps", skillLevel: 0 },
        { skillName: "Modelos de Classificação", skillLevel: 0 }, { skillName: "Modelos de Regressão Linear", skillLevel: 0 },
        { skillName: "OpenCV", skillLevel: 0 }, { skillName: "Orange", skillLevel: 0 }, { skillName: "Pandas", skillLevel: 0 },
        { skillName: "Pinecone", skillLevel: 0 }, { skillName: "Pipelines ETL/ELT", skillLevel: 0 }, { skillName: "Power Automate", skillLevel: 0 },
        { skillName: "Power BI", skillLevel: 0 }, { skillName: "Probabilidade e estatística", skillLevel: 0 },
        { skillName: "Processamento de Linguagem Natural (NLP)", skillLevel: 0 }, { skillName: "Redes Neurais Convolucionais(CNN)", skillLevel: 0 },
        { skillName: "Redes Neurais Recorrentes (RNN)", skillLevel: 0 }, { skillName: "RPA", skillLevel: 0 }, { skillName: "Scikit-learn", skillLevel: 0 },
        { skillName: "Seaborn", skillLevel: 0 }, { skillName: "Selenium", skillLevel: 0 }, { skillName: "Tableau", skillLevel: 0 },
        { skillName: "Tensorflow", skillLevel: 0 }, { skillName: "Testes de Hipóteses", skillLevel: 0 }, { skillName: "UiPath", skillLevel: 0 },
        { skillName: "Visão Computacional - Classificação", skillLevel: 0 }, { skillName: "Visão Computacional - Detecção de Objetos", skillLevel: 0 },
        { skillName: "Reconhecimento de Caracteres", skillLevel: 0 }, { skillName: "Visão Computacional - Segmentação Semântica", skillLevel: 0 },
        { skillName: "YOLO", skillLevel: 0 }
      ]),
      immersive: JSON.stringify([
        { skillName: "DApps (aplicações descentralizadas)", skillLevel: 0 }, { skillName: "Hyperledger Fabric", skillLevel: 0 },
        { skillName: "Proof of Work (PoW), Proof of Stake (PoS), Delegated", skillLevel: 0 }, { skillName: "Rastreabilidade", skillLevel: 0 },
        { skillName: "Solidity (Ethereum)", skillLevel: 0 }, { skillName: "Tokenização (NFTs, DeFi, etc.)", skillLevel: 0 },
        { skillName: "Animação", skillLevel: 0 }, { skillName: "Blender", skillLevel: 0 }, { skillName: "Criação de Shadders", skillLevel: 0 },
        { skillName: "Gamificação", skillLevel: 0 }, { skillName: "Gêmeos Digitais", skillLevel: 0 }, { skillName: "Maya", skillLevel: 0 },
        { skillName: "Metaverso", skillLevel: 0 }, { skillName: "Modelagem 3D", skillLevel: 0 }, { skillName: "Rigging", skillLevel: 0 },
        { skillName: "RM", skillLevel: 0 }, { skillName: "Unity", skillLevel: 0 }, { skillName: "Unreal", skillLevel: 0 },
        { skillName: "VA", skillLevel: 0 }, { skillName: "VR", skillLevel: 0 }, { skillName: "Vuforia", skillLevel: 0 }, { skillName: "ZBrush", skillLevel: 0 }
      ]),
      marketing: JSON.stringify([
        { skillName: "E-mail Marketing", skillLevel: 0 }, { skillName: "Google ADS", skillLevel: 0 }, { skillName: "Google Analytics", skillLevel: 0 },
        { skillName: "Meta ADS", skillLevel: 0 }, { skillName: "Mídias Digitais", skillLevel: 0 }, { skillName: "Omnichannel", skillLevel: 0 },
        { skillName: "Redes Sociais", skillLevel: 0 }, { skillName: "SEO", skillLevel: 0 }
      ])
    },
    {
      username: "janaina@senai.br", password: "password123", name: "Janaina Falco", fullName: "Janaina Ferreira Falco", unit: "Filial A", lastUpdate: new Date().toISOString(),
      backend: JSON.stringify([
        { skillName: ".NET", skillLevel: 0 }, { skillName: "API REST", skillLevel: 0 }, { skillName: "AssertJ", skillLevel: 0 },
        { skillName: "Banco de Dados de Grafos", skillLevel: 0 }, { skillName: "C#", skillLevel: 0 }, { skillName: "Dbeaver", skillLevel: 0 },
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
        { skillName: "Next.js", skillLevel: 0 }, { skillName: "React Hook Form", skillLevel: 0 }, { skillName: "Redux", skillLevel: 0 },
        { skillName: "React", skillLevel: 0 }, { skillName: "Tailwind CSS", skillLevel: 0 }, { skillName: "TypeScript", skillLevel: 0 },
        { skillName: "StoryBook", skillLevel: 0 }, { skillName: "UI", skillLevel: 0 }, { skillName: "UX", skillLevel: 0 }
      ]),
      mobile: JSON.stringify([
        { skillName: "Dart", skillLevel: 0 }, { skillName: "Desenvolvimento Smart TV", skillLevel: 0 },
        { skillName: "Desenvolvimento Smart Watch", skillLevel: 0 }, { skillName: "Electron", skillLevel: 0 },
        { skillName: "Flutter", skillLevel: 0 }, { skillName: "Kotlin", skillLevel: 0 },
        { skillName: "Publicação Apple Store", skillLevel: 0 }, { skillName: "Publicação Play Store", skillLevel: 0 },
        { skillName: "React Native", skillLevel: 0 }, { skillName: "Swift", skillLevel: 0 }
      ]),
      architecture: JSON.stringify([
        { skillName: "Aplicações Monolíticas", skillLevel: 0 }, { skillName: "Clean Code", skillLevel: 0 },
        { skillName: "Codereview", skillLevel: 0 }, { skillName: "Design Patterns", skillLevel: 0 },
        { skillName: "Design System", skillLevel: 0 }, { skillName: "Design Thinking", skillLevel: 0 },
        { skillName: "Documentação de Software", skillLevel: 0 }, { skillName: "Figma", skillLevel: 0 },
        { skillName: "Firebase", skillLevel: 0 }, { skillName: "Git", skillLevel: 0 }, { skillName: "GitHub", skillLevel: 0 },
        { skillName: "Microserviços", skillLevel: 0 }, { skillName: "POO", skillLevel: 0 },
        { skillName: "Prototipagem", skillLevel: 0 }, { skillName: "Serverless", skillLevel: 0 }, { skillName: "SOLID", skillLevel: 0 }
      ]),
      management: JSON.stringify([
        { skillName: "Scrum", skillLevel: 0 }, { skillName: "Kanban", skillLevel: 0 }
      ]),
      security: JSON.stringify([
        { skillName: "Adequação LGPD", skillLevel: 0 }, { skillName: "Análise de Risco", skillLevel: 0 },
        { skillName: "Compliance Geral", skillLevel: 0 }, { skillName: "Criptografia", skillLevel: 0 },
        { skillName: "Governança", skillLevel: 0 }, { skillName: "Hardening", skillLevel: 0 },
        { skillName: "ISA 62.443 (IEC 62443)", skillLevel: 0 }, { skillName: "ISO 22301 (Continuidade de Negócios)", skillLevel: 0 },
        { skillName: "ISO 27001", skillLevel: 0 }, { skillName: "ISO 27005 (Gestão de Riscos)", skillLevel: 0 },
        { skillName: "ISO 27701 (Privacidade/LGPD)", skillLevel: 0 }, { skillName: "Kali Linux", skillLevel: 0 },
        { skillName: "OWASP ZAP", skillLevel: 0 }, { skillName: "Pentest", skillLevel: 0 },
        { skillName: "Segurança da Informação em Automação Industrial", skillLevel: 0 },
        { skillName: "Segurança em Código (Security by Design)", skillLevel: 0 }, { skillName: "Segurança em Redes", skillLevel: 0 },
        { skillName: "TISAX (Automotivo)", skillLevel: 0 }
      ]),
      infra: JSON.stringify([
        { skillName: "Amazon Web Services", skillLevel: 0 }, { skillName: "Apache", skillLevel: 0 }, { skillName: "Apache Kafka", skillLevel: 0 },
        { skillName: "Apache Spark", skillLevel: 0 }, { skillName: "Arduino", skillLevel: 0 }, { skillName: "Azure", skillLevel: 0 },
        { skillName: "Azure DevOps", skillLevel: 0 }, { skillName: "Computação em Nuvem", skillLevel: 0 },
        { skillName: "Configurações de Rede", skillLevel: 0 }, { skillName: "Databricks", skillLevel: 0 },
        { skillName: "Deploy de aplicações", skillLevel: 0 }, { skillName: "DevOps", skillLevel: 0 }, { skillName: "Docker", skillLevel: 0 },
        { skillName: "Github Actions", skillLevel: 0 }, { skillName: "Google Cloud Platform", skillLevel: 0 },
        { skillName: "Grafana", skillLevel: 0 }, { skillName: "Hadoop", skillLevel: 0 }, { skillName: "IIS", skillLevel: 0 },
        { skillName: "IoT", skillLevel: 0 }, { skillName: "Jenkins", skillLevel: 0 }, { skillName: "Kubernetes", skillLevel: 0 },
        { skillName: "NGinx", skillLevel: 0 }, { skillName: "Prometheus", skillLevel: 0 }, { skillName: "RabbitMQ", skillLevel: 0 },
        { skillName: "Serviços de Mensageria PUB/SUB", skillLevel: 0 }, { skillName: "Servidores Linux", skillLevel: 0 },
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
        { skillName: "Machine Learning", skillLevel: 0 }, { skillName: "Matplotlib", skillLevel: 0 }, { skillName: "MLOps", skillLevel: 0 },
        { skillName: "Modelos de Classificação", skillLevel: 0 }, { skillName: "Modelos de Regressão Linear", skillLevel: 0 },
        { skillName: "OpenCV", skillLevel: 0 }, { skillName: "Orange", skillLevel: 0 }, { skillName: "Pandas", skillLevel: 0 },
        { skillName: "Pinecone", skillLevel: 0 }, { skillName: "Pipelines ETL/ELT", skillLevel: 0 }, { skillName: "Power Automate", skillLevel: 0 },
        { skillName: "Power BI", skillLevel: 0 }, { skillName: "Probabilidade e estatística", skillLevel: 0 },
        { skillName: "Processamento de Linguagem Natural (NLP)", skillLevel: 0 }, { skillName: "Redes Neurais Convolucionais(CNN)", skillLevel: 0 },
        { skillName: "Redes Neurais Recorrentes (RNN)", skillLevel: 0 }, { skillName: "RPA", skillLevel: 0 }, { skillName: "Scikit-learn", skillLevel: 0 },
        { skillName: "Seaborn", skillLevel: 0 }, { skillName: "Selenium", skillLevel: 0 }, { skillName: "Tableau", skillLevel: 0 },
        { skillName: "Tensorflow", skillLevel: 0 }, { skillName: "Testes de Hipóteses", skillLevel: 0 }, { skillName: "UiPath", skillLevel: 0 },
        { skillName: "Visão Computacional - Classificação", skillLevel: 0 }, { skillName: "Visão Computacional - Detecção de Objetos", skillLevel: 0 },
        { skillName: "Reconhecimento de Caracteres", skillLevel: 0 }, { skillName: "Visão Computacional - Segmentação Semântica", skillLevel: 0 },
        { skillName: "YOLO", skillLevel: 0 }
      ]),
      immersive: JSON.stringify([
        { skillName: "DApps (aplicações descentralizadas)", skillLevel: 0 }, { skillName: "Hyperledger Fabric", skillLevel: 0 },
        { skillName: "Proof of Work (PoW), Proof of Stake (PoS), Delegated", skillLevel: 0 }, { skillName: "Rastreabilidade", skillLevel: 0 },
        { skillName: "Solidity (Ethereum)", skillLevel: 0 }, { skillName: "Tokenização (NFTs, DeFi, etc.)", skillLevel: 0 },
        { skillName: "Animação", skillLevel: 0 }, { skillName: "Blender", skillLevel: 0 }, { skillName: "Criação de Shadders", skillLevel: 0 },
        { skillName: "Gamificação", skillLevel: 0 }, { skillName: "Gêmeos Digitais", skillLevel: 0 }, { skillName: "Maya", skillLevel: 0 },
        { skillName: "Metaverso", skillLevel: 0 }, { skillName: "Modelagem 3D", skillLevel: 0 }, { skillName: "Rigging", skillLevel: 0 },
        { skillName: "RM", skillLevel: 0 }, { skillName: "Unity", skillLevel: 0 }, { skillName: "Unreal", skillLevel: 0 },
        { skillName: "VA", skillLevel: 0 }, { skillName: "VR", skillLevel: 0 }, { skillName: "Vuforia", skillLevel: 0 }, { skillName: "ZBrush", skillLevel: 0 }
      ]),
      marketing: JSON.stringify([
        { skillName: "E-mail Marketing", skillLevel: 0 }, { skillName: "Google ADS", skillLevel: 0 }, { skillName: "Google Analytics", skillLevel: 0 },
        { skillName: "Meta ADS", skillLevel: 0 }, { skillName: "Mídias Digitais", skillLevel: 0 }, { skillName: "Omnichannel", skillLevel: 0 },
        { skillName: "Redes Sociais", skillLevel: 0 }, { skillName: "SEO", skillLevel: 0 }
      ])
    },
    {
      username: "admin@senai.br", password: "adminpassword", name: "Admin", fullName: "System Administrator", unit: "Sede", lastUpdate: new Date().toISOString(),
      backend: JSON.stringify([
        { skillName: ".NET", skillLevel: 0 }, { skillName: "API REST", skillLevel: 0 }, { skillName: "AssertJ", skillLevel: 0 },
        { skillName: "Banco de Dados de Grafos", skillLevel: 0 }, { skillName: "C#", skillLevel: 0 }, { skillName: "Dbeaver", skillLevel: 0 },
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
        { skillName: "Next.js", skillLevel: 0 }, { skillName: "React Hook Form", skillLevel: 0 }, { skillName: "Redux", skillLevel: 0 },
        { skillName: "React", skillLevel: 0 }, { skillName: "Tailwind CSS", skillLevel: 0 }, { skillName: "TypeScript", skillLevel: 0 },
        { skillName: "StoryBook", skillLevel: 0 }, { skillName: "UI", skillLevel: 0 }, { skillName: "UX", skillLevel: 0 }
      ]),
      mobile: JSON.stringify([
        { skillName: "Dart", skillLevel: 0 }, { skillName: "Desenvolvimento Smart TV", skillLevel: 0 },
        { skillName: "Desenvolvimento Smart Watch", skillLevel: 0 }, { skillName: "Electron", skillLevel: 0 },
        { skillName: "Flutter", skillLevel: 0 }, { skillName: "Kotlin", skillLevel: 0 },
        { skillName: "Publicação Apple Store", skillLevel: 0 }, { skillName: "Publicação Play Store", skillLevel: 0 },
        { skillName: "React Native", skillLevel: 0 }, { skillName: "Swift", skillLevel: 0 }
      ]),
      architecture: JSON.stringify([
        { skillName: "Aplicações Monolíticas", skillLevel: 0 }, { skillName: "Clean Code", skillLevel: 0 },
        { skillName: "Codereview", skillLevel: 0 }, { skillName: "Design Patterns", skillLevel: 0 },
        { skillName: "Design System", skillLevel: 0 }, { skillName: "Design Thinking", skillLevel: 0 },
        { skillName: "Documentação de Software", skillLevel: 0 }, { skillName: "Figma", skillLevel: 0 },
        { skillName: "Firebase", skillLevel: 0 }, { skillName: "Git", skillLevel: 0 }, { skillName: "GitHub", skillLevel: 0 },
        { skillName: "Microserviços", skillLevel: 0 }, { skillName: "POO", skillLevel: 0 },
        { skillName: "Prototipagem", skillLevel: 0 }, { skillName: "Serverless", skillLevel: 0 }, { skillName: "SOLID", skillLevel: 0 }
      ]),
      management: JSON.stringify([
        { skillName: "Scrum", skillLevel: 0 }, { skillName: "Kanban", skillLevel: 0 }
      ]),
      security: JSON.stringify([
        { skillName: "Adequação LGPD", skillLevel: 0 }, { skillName: "Análise de Risco", skillLevel: 0 },
        { skillName: "Compliance Geral", skillLevel: 0 }, { skillName: "Criptografia", skillLevel: 0 },
        { skillName: "Governança", skillLevel: 0 }, { skillName: "Hardening", skillLevel: 0 },
        { skillName: "ISA 62.443 (IEC 62443)", skillLevel: 0 }, { skillName: "ISO 22301 (Continuidade de Negócios)", skillLevel: 0 },
        { skillName: "ISO 27001", skillLevel: 0 }, { skillName: "ISO 27005 (Gestão de Riscos)", skillLevel: 0 },
        { skillName: "ISO 27701 (Privacidade/LGPD)", skillLevel: 0 }, { skillName: "Kali Linux", skillLevel: 0 },
        { skillName: "OWASP ZAP", skillLevel: 0 }, { skillName: "Pentest", skillLevel: 0 },
        { skillName: "Segurança da Informação em Automação Industrial", skillLevel: 0 },
        { skillName: "Segurança em Código (Security by Design)", skillLevel: 0 }, { skillName: "Segurança em Redes", skillLevel: 0 },
        { skillName: "TISAX (Automotivo)", skillLevel: 0 }
      ]),
      infra: JSON.stringify([
        { skillName: "Amazon Web Services", skillLevel: 0 }, { skillName: "Apache", skillLevel: 0 }, { skillName: "Apache Kafka", skillLevel: 0 },
        { skillName: "Apache Spark", skillLevel: 0 }, { skillName: "Arduino", skillLevel: 0 }, { skillName: "Azure", skillLevel: 0 },
        { skillName: "Azure DevOps", skillLevel: 0 }, { skillName: "Computação em Nuvem", skillLevel: 0 },
        { skillName: "Configurações de Rede", skillLevel: 0 }, { skillName: "Databricks", skillLevel: 0 },
        { skillName: "Deploy de aplicações", skillLevel: 0 }, { skillName: "DevOps", skillLevel: 0 }, { skillName: "Docker", skillLevel: 0 },
        { skillName: "Github Actions", skillLevel: 0 }, { skillName: "Google Cloud Platform", skillLevel: 0 },
        { skillName: "Grafana", skillLevel: 0 }, { skillName: "Hadoop", skillLevel: 0 }, { skillName: "IIS", skillLevel: 0 },
        { skillName: "IoT", skillLevel: 0 }, { skillName: "Jenkins", skillLevel: 0 }, { skillName: "Kubernetes", skillLevel: 0 },
        { skillName: "NGinx", skillLevel: 0 }, { skillName: "Prometheus", skillLevel: 0 }, { skillName: "RabbitMQ", skillLevel: 0 },
        { skillName: "Serviços de Mensageria PUB/SUB", skillLevel: 0 }, { skillName: "Servidores Linux", skillLevel: 0 },
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
        { skillName: "Machine Learning", skillLevel: 0 }, { skillName: "Matplotlib", skillLevel: 0 }, { skillName: "MLOps", skillLevel: 0 },
        { skillName: "Modelos de Classificação", skillLevel: 0 }, { skillName: "Modelos de Regressão Linear", skillLevel: 0 },
        { skillName: "OpenCV", skillLevel: 0 }, { skillName: "Orange", skillLevel: 0 }, { skillName: "Pandas", skillLevel: 0 },
        { skillName: "Pinecone", skillLevel: 0 }, { skillName: "Pipelines ETL/ELT", skillLevel: 0 }, { skillName: "Power Automate", skillLevel: 0 },
        { skillName: "Power BI", skillLevel: 0 }, { skillName: "Probabilidade e estatística", skillLevel: 0 },
        { skillName: "Processamento de Linguagem Natural (NLP)", skillLevel: 0 }, { skillName: "Redes Neurais Convolucionais(CNN)", skillLevel: 0 },
        { skillName: "Redes Neurais Recorrentes (RNN)", skillLevel: 0 }, { skillName: "RPA", skillLevel: 0 }, { skillName: "Scikit-learn", skillLevel: 0 },
        { skillName: "Seaborn", skillLevel: 0 }, { skillName: "Selenium", skillLevel: 0 }, { skillName: "Tableau", skillLevel: 0 },
        { skillName: "Tensorflow", skillLevel: 0 }, { skillName: "Testes de Hipóteses", skillLevel: 0 }, { skillName: "UiPath", skillLevel: 0 },
        { skillName: "Visão Computacional - Classificação", skillLevel: 0 }, { skillName: "Visão Computacional - Detecção de Objetos", skillLevel: 0 },
        { skillName: "Reconhecimento de Caracteres", skillLevel: 0 }, { skillName: "Visão Computacional - Segmentação Semântica", skillLevel: 0 },
        { skillName: "YOLO", skillLevel: 0 }
      ]),
      immersive: JSON.stringify([
        { skillName: "DApps (aplicações descentralizadas)", skillLevel: 0 }, { skillName: "Hyperledger Fabric", skillLevel: 0 },
        { skillName: "Proof of Work (PoW), Proof of Stake (PoS), Delegated", skillLevel: 0 }, { skillName: "Rastreabilidade", skillLevel: 0 },
        { skillName: "Solidity (Ethereum)", skillLevel: 0 }, { skillName: "Tokenização (NFTs, DeFi, etc.)", skillLevel: 0 },
        { skillName: "Animação", skillLevel: 0 }, { skillName: "Blender", skillLevel: 0 }, { skillName: "Criação de Shadders", skillLevel: 0 },
        { skillName: "Gamificação", skillLevel: 0 }, { skillName: "Gêmeos Digitais", skillLevel: 0 }, { skillName: "Maya", skillLevel: 0 },
        { skillName: "Metaverso", skillLevel: 0 }, { skillName: "Modelagem 3D", skillLevel: 0 }, { skillName: "Rigging", skillLevel: 0 },
        { skillName: "RM", skillLevel: 0 }, { skillName: "Unity", skillLevel: 0 }, { skillName: "Unreal", skillLevel: 0 },
        { skillName: "VA", skillLevel: 0 }, { skillName: "VR", skillLevel: 0 }, { skillName: "Vuforia", skillLevel: 0 }, { skillName: "ZBrush", skillLevel: 0 }
      ]),
      marketing: JSON.stringify([
        { skillName: "E-mail Marketing", skillLevel: 0 }, { skillName: "Google ADS", skillLevel: 0 }, { skillName: "Google Analytics", skillLevel: 0 },
        { skillName: "Meta ADS", skillLevel: 0 }, { skillName: "Mídias Digitais", skillLevel: 0 }, { skillName: "Omnichannel", skillLevel: 0 },
        { skillName: "Redes Sociais", skillLevel: 0 }, { skillName: "SEO", skillLevel: 0 }
      ])
    }
  ];

  const allSkillCategories = { // Este objeto define a estrutura padrão de skills para os novos usuários
    backend: JSON.parse(initialUsers[0].backend), // Pega a estrutura do primeiro usuário como base
    frontend: JSON.parse(initialUsers[0].frontend),
    mobile: JSON.parse(initialUsers[0].mobile),
    architecture: JSON.parse(initialUsers[0].architecture),
    management: JSON.parse(initialUsers[0].management),
    security: JSON.parse(initialUsers[0].security),
    infra: JSON.parse(initialUsers[0].infra),
    data: JSON.parse(initialUsers[0].data),
    immersive: JSON.parse(initialUsers[0].immersive),
    marketing: JSON.parse(initialUsers[0].marketing)
  };

  const newUsersList = [
    { username: "bruno.fernandes@senai.br", name: "Bruno", fullName: "Bruno Henrique Fernandes" },
    { username: "christian.alonso@senai.br", name: "Christian", fullName: "Christian Albuquerque Alonso" },
    { username: "daniel.santos@senai.br", name: "Daniel", fullName: "Daniel Wilson Alves dos Santos" },
    { username: "erick.barbosa@senai.br", name: "Erick", fullName: "Erick Araujo Barbosa" },
    { username: "flavio.dias@senai.br", name: "Flávio", fullName: "Flávio Camilo Dias" },
    { username: "joao.meyer@senai.br", name: "João", fullName: "João Henrique Parizoti Meyer" },
    { username: "lucas.silva@senai.br", name: "Lucas", fullName: "Lucas Araujo Oliveira Silva" },
    { username: "lukas.venancio@senai.br", name: "Lukas", fullName: "Lukas Santos Venâncio" },
    { username: "pedro.santos@senai.br", name: "Pedro", fullName: "Pedro Henrique Silva Santos" },
    { username: "raphael.nascimento@senai.br", name: "Raphael", fullName: "Raphael Lima Marques do Nascimento" },
    { username: "rodrigo.silva@senai.br", name: "Rodrigo", fullName: "Rodrigo Areias da Silva" },
    { username: "rogger.silveira@senai.br", name: "Rogger", fullName: "Rogger da Silva Silveira" },
    { username: "wesley.meneghini@senai.br", name: "Wesley", fullName: "Wesley Meneghini" },
    { username: "wilson.carneiro@senai.br", name: "Wilson", fullName: "Wilson Rogerio Carneiro" }
  ];

  newUsersList.forEach(u => {
    initialUsers.push({
      username: u.username,
      password: "password123",
      name: u.name,
      fullName: u.fullName,
      unit: u.unit || "Não Definida",
      lastUpdate: new Date().toISOString(),
      backend: JSON.stringify(allSkillCategories.backend),
      frontend: JSON.stringify(allSkillCategories.frontend),
      mobile: JSON.stringify(allSkillCategories.mobile),
      architecture: JSON.stringify(allSkillCategories.architecture),
      management: JSON.stringify(allSkillCategories.management),
      security: JSON.stringify(allSkillCategories.security),
      infra: JSON.stringify(allSkillCategories.infra),
      data: JSON.stringify(allSkillCategories.data),
      immersive: JSON.stringify(allSkillCategories.immersive),
      marketing: JSON.stringify(allSkillCategories.marketing)
    });
  });

  for (const user of initialUsers) {
    const hash = await bcrypt.hash(user.password, 10);
    const values = [
      user.username, hash, user.name, user.fullName, user.unit, user.lastUpdate,
      user.backend, user.frontend, user.mobile, user.architecture,
      user.management, user.security, user.infra, user.data,
      user.immersive, user.marketing
    ];

    await pool.query(
      `INSERT INTO users (
        username, password_hash, name, "fullName", unit, lastUpdate,
        backend, frontend, mobile, architecture, management,
        security, infra, data, immersive, marketing
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7::jsonb, $8::jsonb, $9::jsonb, $10::jsonb, $11::jsonb,
        $12::jsonb, $13::jsonb, $14::jsonb, $15::jsonb, $16::jsonb
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
        marketing JSONB DEFAULT '[]'
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