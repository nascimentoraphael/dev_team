const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

// Conecta ou cria o banco de dados. O arquivo será 'devteam.db' na mesma pasta.
const DBSOURCE = "devteam.db";

const db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    // Não pode abrir o banco de dados
    console.error(err.message);
    throw err;
  } else {
    console.log('Conectado ao banco de dados SQLite.');
    db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password_hash TEXT,
            name TEXT,
            fullName TEXT,
            lastUpdate TEXT,
            backend TEXT,
            frontend TEXT,
            mobile TEXT,
            architecture TEXT,
            management TEXT,
            security TEXT,
            infra TEXT,
            data TEXT,
            immersive TEXT,
            marketing TEXT,
            CONSTRAINT username_unique UNIQUE (username)
        )`, (err) => {
      if (err) {
        // Tabela já criada ou outro erro
        console.log("Tabela 'users' já existe ou erro ao criar:", err.message);
      } else {
        // Tabela acabou de ser criada, vamos adicionar alguns usuários de exemplo
        // Apenas se a tabela foi recém-criada (para evitar duplicatas em reinícios)
        console.log("Tabela 'users' criada. Inserindo dados de exemplo se necessário.");
        insertInitialData();
      }
    });
  }
});

function insertInitialData() {
  const initialUsers = [
    {
      username: "italo@example.com", password: "password123", name: "Italo Ignacio", fullName: "Italo Felipe Ignacio", lastUpdate: new Date().toISOString(),
      backend: JSON.stringify([
        { skillName: "API REST", skillLevel: 0 }, { skillName: "Express", skillLevel: 0 },
        { skillName: "Java", skillLevel: 0 }, { skillName: "Node.js", skillLevel: 0 },
        { skillName: "PostgreSQL", skillLevel: 0 }, { skillName: "Spring Boot", skillLevel: 0 }
      ]),
      frontend: JSON.stringify([
        { skillName: "React", skillLevel: 0 }, { skillName: "Next.js", skillLevel: 0 },
        { skillName: "Tailwind CSS", skillLevel: 0 }, { skillName: "TypeScript", skillLevel: 0 }
      ]),
      mobile: JSON.stringify([{ skillName: "React Native", skillLevel: 0 }]),
      architecture: JSON.stringify([
        { skillName: "Clean Code", skillLevel: 0 }, { skillName: "Git", skillLevel: 0 }, { skillName: "GitHub", skillLevel: 0 }
      ]),
      management: JSON.stringify([{ skillName: "Scrum", skillLevel: 0 }]),
      security: JSON.stringify([]),
      infra: JSON.stringify([{ skillName: "Docker", skillLevel: 0 }, { skillName: "AWS", skillLevel: 0 }]),
      data: JSON.stringify([]),
      immersive: JSON.stringify([]),
      marketing: JSON.stringify([])
    },
    {
      username: "janaina@example.com", password: "password123", name: "Janaina Falco", fullName: "Janaina Ferreira Falco", lastUpdate: new Date().toISOString(),
      backend: JSON.stringify([{ skillName: "PHP", skillLevel: 0 }, { skillName: "Spring Boot", skillLevel: 0 }]),
      frontend: JSON.stringify([
        { skillName: "Bootstrap", skillLevel: 0 }, { skillName: "CSS", skillLevel: 0 }, { skillName: "HTML", skillLevel: 0 },
        { skillName: "JavaScript", skillLevel: 0 }, { skillName: "React", skillLevel: 0 }, { skillName: "Wordpress", skillLevel: 0 }
      ]),
      mobile: JSON.stringify([{ skillName: "Flutter", skillLevel: 0 }, { skillName: "React Native", skillLevel: 0 }]),
      architecture: JSON.stringify([
        { skillName: "Figma", skillLevel: 0 }, { skillName: "Firebase", skillLevel: 0 }, { skillName: "Git", skillLevel: 0 }
      ]),
      management: JSON.stringify([{ skillName: "Kanban", skillLevel: 0 }, { skillName: "Scrum", skillLevel: 0 }]),
      security: JSON.stringify([{ skillName: "Adequação LGPD", skillLevel: 0 }]),
      infra: JSON.stringify([{ skillName: "AWS", skillLevel: 0 }]),
      data: JSON.stringify([]),
      immersive: JSON.stringify([]),
      marketing: JSON.stringify([{ skillName: "SEO", skillLevel: 0 }])
    }
    // Adicione mais usuários conforme necessário, espelhando a estrutura do seu teamData original
  ];

  const insert = 'INSERT OR IGNORE INTO users (username, password_hash, name, fullName, lastUpdate, backend, frontend, mobile, architecture, management, security, infra, data, immersive, marketing) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
  initialUsers.forEach(user => {
    bcrypt.hash(user.password, 10, (err, hash) => {
      if (err) {
        console.error("Erro ao gerar hash para usuário inicial:", user.username, err);
        return;
      }
      db.run(insert, [
        user.username, hash, user.name, user.fullName, user.lastUpdate,
        user.backend, user.frontend, user.mobile, user.architecture,
        user.management, user.security, user.infra, user.data,
        user.immersive, user.marketing
      ], (err) => {
        if (err) console.error("Erro ao inserir usuário inicial:", user.username, err.message);
        else console.log("Usuário inicial inserido/ignorado:", user.username);
      });
    });
  });
}

module.exports = db;