import 'dotenv/config';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

function rand(min, max) { return Math.random() * (max - min) + min; }

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set. Create backend/.env from backend/.env.example and set a valid MySQL URL (e.g., mysql://root@127.0.0.1:3306/roadside_assist for XAMPP).');
  }
  const conn = await mysql.createConnection(process.env.DATABASE_URL);

  // Ensure tables exist (idempotent) - light guard if db:init wasn't run
  await conn.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      phone VARCHAR(20) NOT NULL UNIQUE,
      name VARCHAR(60),
      role VARCHAR(20) NOT NULL DEFAULT 'user',
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS workshops (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      address VARCHAR(255) NOT NULL,
      lat DOUBLE NOT NULL,
      lng DOUBLE NOT NULL,
      rating DECIMAL(2,1) NOT NULL DEFAULT 4.2,
      reviews INT NOT NULL DEFAULT 0,
      isOpen TINYINT(1) NOT NULL DEFAULT 1,
      openTime VARCHAR(5) NOT NULL DEFAULT '09:00',
      closeTime VARCHAR(5) NOT NULL DEFAULT '21:00',
      services TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  // Seed a default admin user if not exists
  const adminPhone = '+911111111111';
  const [rows] = await conn.query('SELECT id FROM users WHERE phone = ?', [adminPhone]);
  if (rows.length === 0) {
    const hash = await bcrypt.hash('admin123', 10);
    await conn.query('INSERT INTO users (phone, name, role, password_hash) VALUES (?, ?, ?, ?)', [adminPhone, 'Admin', 'admin', hash]);
  }

  // Seed workshops around Bengaluru
  const center = { lat: 12.9716, lng: 77.5946 };
  const servicesPool = ['Tire Change','Battery Jump','Fuel Delivery','Towing','Minor Repairs','Oil Change'];

  // Clear existing workshops for a clean seed
  await conn.query('DELETE FROM workshops');

  const values = [];
  for (let i = 0; i < 25; i++) {
    const dLat = rand(-0.15, 0.15);
    const dLng = rand(-0.15, 0.15);
    const lat = center.lat + dLat;
    const lng = center.lng + dLng;
    const shuffled = servicesPool.slice().sort(() => 0.5 - Math.random());
    const count = 3 + Math.floor(Math.random() * 3);
    const pick = shuffled.slice(0, count);
    values.push([
      `Garage ${i + 1}`,
      `Area ${i + 1}, Bengaluru`,
      lat,
      lng,
      (3.5 + Math.random() * 1.5).toFixed(1),
      Math.floor(Math.random() * 500),
      Math.random() > 0.2 ? 1 : 0,
      '09:00',
      '21:00',
      JSON.stringify(pick),
    ]);
  }

  await conn.query(
    'INSERT INTO workshops (name, address, lat, lng, rating, reviews, isOpen, openTime, closeTime, services) VALUES ?',[values]
  );

  console.log('Seed complete.');
  await conn.end();
}

main().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
