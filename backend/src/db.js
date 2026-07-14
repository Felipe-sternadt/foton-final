import mysql from 'mysql2/promise';
import { config } from './config.js';

export const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  ssl: config.db.ssl ? { rejectUnauthorized: config.db.sslRejectUnauthorized } : undefined,
  connectTimeout: 10000,
  enableKeepAlive: true,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
  // Mantem a collation da conexao igual a das tabelas. Sem isso, algumas
  // versoes do MySQL recusam comparacoes entre parametros e colunas UUID.
  charset: 'utf8mb4_unicode_ci'
});

export async function pingDatabase() {
  const [rows] = await pool.query('SELECT 1 AS ok');
  return rows[0]?.ok === 1;
}
