import { pool } from '../src/db.js';

try {
  const [rows] = await pool.query(`
    SELECT
      public_id,
      form_type,
      name,
      email,
      phone,
      model,
      city,
      state,
      crm_status,
      email_status,
      email_recipient,
      email_sent_at,
      created_at
    FROM leads
    ORDER BY created_at DESC
    LIMIT 20
  `);

  if (!rows.length) {
    console.log('No leads found.');
  } else {
    const maskedRows = rows.map((row) => ({
      ...row,
      name: row.name ? `${String(row.name).slice(0, 1)}***` : null,
      email: row.email ? `${String(row.email).slice(0, 1)}***@${String(row.email).split('@')[1] || '***'}` : null,
      phone: row.phone ? `***${String(row.phone).replace(/\D/g, '').slice(-4)}` : null
    }));
    console.table(maskedRows);
  }
} catch (error) {
  console.error('Could not list leads:', error.message || error.code || error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
