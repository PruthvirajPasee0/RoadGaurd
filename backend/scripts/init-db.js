import 'dotenv/config';
import mysql from 'mysql2/promise';

function parseMysqlUrl(urlStr) {
  const u = new URL(urlStr);
  if (u.protocol !== 'mysql:') throw new Error('DATABASE_URL must start with mysql://');
  const user = decodeURIComponent(u.username);
  const password = decodeURIComponent(u.password);
  const host = u.hostname;
  const port = u.port ? Number(u.port) : 3306;
  const database = u.pathname?.replace(/^\//, '');
  return { user, password, host, port, database };
}

async function ensureDatabase(conn, dbName) {
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set. Create backend/.env from backend/.env.example and set a valid MySQL URL (e.g., mysql://root@127.0.0.1:3306/roadside_assist for XAMPP).');
  }
  const cfg = parseMysqlUrl(process.env.DATABASE_URL);

  // Connect without database to ensure DB exists
  const root = await mysql.createConnection({ host: cfg.host, port: cfg.port, user: cfg.user, password: cfg.password, multipleStatements: true });
  await ensureDatabase(root, cfg.database);
  await root.end();

  // Connect to the target database
  const db = await mysql.createConnection({ host: cfg.host, port: cfg.port, user: cfg.user, password: cfg.password, database: cfg.database, multipleStatements: true });

  // Create tables
  const createUsers = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      phone VARCHAR(20) NOT NULL UNIQUE,
      name VARCHAR(60),
      email VARCHAR(120),
      role ENUM('user','worker','admin') NOT NULL DEFAULT 'user',
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_users_role (role)
    ) ENGINE=InnoDB;
  `;

  const createWorkshops = `
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
      image_url VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_workshops_isopen (isOpen)
    ) ENGINE=InnoDB;
  `;

  const createServiceRequests = `
    CREATE TABLE IF NOT EXISTS service_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      workshopId INT NULL,
      assignedWorkerId INT NULL,
      service VARCHAR(100) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      vehicle_make VARCHAR(50),
      vehicle_model VARCHAR(50),
      vehicle_year VARCHAR(10),
      registration_number VARCHAR(30),
      location_address VARCHAR(255),
      lat DOUBLE,
      lng DOUBLE,
      notes TEXT,
      urgency VARCHAR(20) DEFAULT 'normal',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_sr_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_sr_workshop FOREIGN KEY (workshopId) REFERENCES workshops(id) ON DELETE SET NULL,
      CONSTRAINT fk_sr_worker FOREIGN KEY (assignedWorkerId) REFERENCES users(id) ON DELETE SET NULL,
      INDEX idx_sr_status (status),
      INDEX idx_sr_user (userId),
      INDEX idx_sr_workshop (workshopId)
    ) ENGINE=InnoDB;
  `;

  const createWorkerAssignments = `
    CREATE TABLE IF NOT EXISTS worker_assignments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      workshopId INT NOT NULL,
      is_primary TINYINT(1) NOT NULL DEFAULT 0,
      active TINYINT(1) NOT NULL DEFAULT 1,
      assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ended_at TIMESTAMP NULL DEFAULT NULL,
      CONSTRAINT fk_wa_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_wa_workshop FOREIGN KEY (workshopId) REFERENCES workshops(id) ON DELETE CASCADE,
      INDEX idx_wa_user (userId),
      INDEX idx_wa_workshop (workshopId),
      INDEX idx_wa_active (active)
    ) ENGINE=InnoDB;
  `;

  const createReviews = `
    CREATE TABLE IF NOT EXISTS reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      requestId INT NOT NULL,
      workshopId INT NOT NULL,
      userId INT NOT NULL,
      rating TINYINT UNSIGNED NOT NULL,
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_rev_request FOREIGN KEY (requestId) REFERENCES service_requests(id) ON DELETE CASCADE,
      CONSTRAINT fk_rev_workshop FOREIGN KEY (workshopId) REFERENCES workshops(id) ON DELETE CASCADE,
      CONSTRAINT fk_rev_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY uniq_review_user_request (requestId, userId),
      INDEX idx_rev_workshop (workshopId)
    ) ENGINE=InnoDB;
  `;

  const createNotifications = `
    CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      title VARCHAR(150) NOT NULL,
      body TEXT,
      is_read TINYINT(1) NOT NULL DEFAULT 0,
      read_at TIMESTAMP NULL DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_notif_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_notif_user_read (userId, is_read)
    ) ENGINE=InnoDB;
  `;

  const createRequestStatusHistory = `
    CREATE TABLE IF NOT EXISTS request_status_history (
      id INT AUTO_INCREMENT PRIMARY KEY,
      requestId INT NOT NULL,
      from_status VARCHAR(20),
      to_status VARCHAR(20) NOT NULL,
      changedByUserId INT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_rsh_request FOREIGN KEY (requestId) REFERENCES service_requests(id) ON DELETE CASCADE,
      CONSTRAINT fk_rsh_user FOREIGN KEY (changedByUserId) REFERENCES users(id) ON DELETE SET NULL,
      INDEX idx_rsh_request (requestId)
    ) ENGINE=InnoDB;
  `;

  await db.query(createUsers);
  await db.query(createWorkshops);
  await db.query(createServiceRequests);
  await db.query(createWorkerAssignments);
  await db.query(createReviews);
  await db.query(createNotifications);
  await db.query(createRequestStatusHistory);

  console.log('Database schema initialized.');
  await db.end();
}

main().catch((e) => {
  console.error('DB init failed:', e);
  process.exit(1);
});
