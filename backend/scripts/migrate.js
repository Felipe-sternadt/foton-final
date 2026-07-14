import { pool } from '../src/db.js';

const requiredColumns = [
  {
    name: 'request_id',
    sql: 'ALTER TABLE leads ADD COLUMN request_id CHAR(36) NULL AFTER public_id'
  },
  {
    name: 'email_status',
    sql: "ALTER TABLE leads ADD COLUMN email_status ENUM('pending', 'sent', 'failed', 'disabled') NOT NULL DEFAULT 'pending' AFTER crm_sent_at"
  },
  {
    name: 'email_recipient',
    sql: 'ALTER TABLE leads ADD COLUMN email_recipient VARCHAR(180) NULL AFTER email_status'
  },
  {
    name: 'email_provider_id',
    sql: 'ALTER TABLE leads ADD COLUMN email_provider_id VARCHAR(100) NULL AFTER email_recipient'
  },
  {
    name: 'email_response',
    sql: 'ALTER TABLE leads ADD COLUMN email_response JSON NULL AFTER email_provider_id'
  },
  {
    name: 'email_sent_at',
    sql: 'ALTER TABLE leads ADD COLUMN email_sent_at DATETIME NULL AFTER email_response'
  }
];

const requiredIndexes = [
  {
    name: 'uq_leads_request_id',
    sql: 'ALTER TABLE leads ADD UNIQUE KEY uq_leads_request_id (request_id)'
  },
  {
    name: 'idx_leads_email_status',
    sql: 'ALTER TABLE leads ADD KEY idx_leads_email_status (email_status)'
  }
];

async function migrate() {
  const connection = await pool.getConnection();

  try {
    const [tables] = await connection.query("SHOW TABLES LIKE 'leads'");
    if (!tables.length) {
      throw new Error('Tabela leads nao encontrada. Execute backend/sql/schema.sql primeiro.');
    }

    const [columnRows] = await connection.query('SHOW COLUMNS FROM leads');
    const columns = new Set(columnRows.map((column) => column.Field));

    for (const migration of requiredColumns) {
      if (columns.has(migration.name)) continue;
      await connection.query(migration.sql);
      console.log(`Added column: ${migration.name}`);
    }

    const [indexRows] = await connection.query('SHOW INDEX FROM leads');
    const indexes = new Set(indexRows.map((index) => index.Key_name));

    for (const migration of requiredIndexes) {
      if (indexes.has(migration.name)) continue;
      await connection.query(migration.sql);
      console.log(`Added index: ${migration.name}`);
    }

    console.log('Database migration completed successfully.');
  } finally {
    connection.release();
    await pool.end();
  }
}

migrate().catch((error) => {
  console.error(`Database migration failed: ${error.message || error.code || 'unknown_error'}`);
  process.exitCode = 1;
});
