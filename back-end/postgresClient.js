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

    const initialUsers = [
      {
        username: "italo@senai.br", password: "password123", name: "Italo Ignacio", fullName: "Italo Felipe Ignacio", unit: "Sede"
      },
      {
        username: "janaina@senai.br", password: "password123", name: "Janaina Falco", fullName: "Janaina Ferreira Falco", unit: "Filial A"
      },
      {
        username: "admin@senai.br", password: "adminpassword", name: "Admin", fullName: "System Administrator", unit: "Sede"
      }
    ];

    const allSkillCategories = require('./skillCategories.json'); // Sugestão: mover as skills para um arquivo JSON

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

    const allUsers = [...initialUsers, ...newUsersList.map(u => ({
      ...u,
      password: 'password123',
      unit: u.unit || 'Não Definida'
    }))];

    for (const user of allUsers) {
      const hash = await bcrypt.hash(user.password, 10);
      const now = new Date().toISOString();
      const values = [
        user.username, hash, user.name, user.fullName, user.unit, now,
        JSON.stringify(allSkillCategories.backend),
        JSON.stringify(allSkillCategories.frontend),
        JSON.stringify(allSkillCategories.mobile),
        JSON.stringify(allSkillCategories.architecture),
        JSON.stringify(allSkillCategories.management),
        JSON.stringify(allSkillCategories.security),
        JSON.stringify(allSkillCategories.infra),
        JSON.stringify(allSkillCategories.data),
        JSON.stringify(allSkillCategories.immersive),
        JSON.stringify(allSkillCategories.marketing)
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
      console.log("Usuário inserido/ignorado:", user.username);
    }

    console.log('Inicialização do banco de dados PostgreSQL concluída.');
  } catch (err) {
    console.error('Erro durante a inicialização do banco de dados PostgreSQL:', err);
  }
}

initializeDatabase().catch(err => {
  console.error("Falha crítica ao inicializar o banco de dados PostgreSQL:", err);
});

module.exports = pool;