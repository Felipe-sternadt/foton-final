import { pool, pingDatabase } from '../src/db.js';

try {
  const isConnected = await pingDatabase();
  const [tables] = await pool.query('SHOW TABLES');
  const [columns] = await pool.query('DESCRIBE leads');
  const [[count]] = await pool.query('SELECT COUNT(*) AS total FROM leads');

  console.log('Database connected:', isConnected);
  console.log('Tables:', tables.map((row) => Object.values(row)[0]).join(', ') || '(none)');
  console.log('Leads total:', count.total);
  console.log('Lead columns:');
  columns.forEach((column) => {
    console.log(`- ${column.Field} (${column.Type})`);
  });
} catch (error) {
  console.error('Database check failed:', error.message || error.code || error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
