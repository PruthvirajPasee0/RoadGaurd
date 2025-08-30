import 'dotenv/config';
import mysql from 'mysql2/promise';

// Use a single connection pool across the app
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Create backend/.env from backend/.env.example. For XAMPP, use mysql://root@127.0.0.1:3306/roadside_assist');
}
const pool = mysql.createPool(process.env.DATABASE_URL);

export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

export async function ping() {
  const [rows] = await pool.query('SELECT 1 AS ok');
  return rows[0]?.ok === 1;
}

export default pool;
