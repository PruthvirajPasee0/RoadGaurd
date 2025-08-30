import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { query } from '../lib/db.js';

const router = express.Router();

const signupSchema = z.object({
  phone: z.string().min(8).max(20),
  name: z.string().min(1).max(60).optional(),
  email: z.string().email().max(120).optional(),
  password: z.string().min(6).max(100),
  role: z.enum(['user', 'worker', 'admin']).optional(),
  adminSecret: z.string().optional(),
});

const signinSchema = z.object({
  phone: z.string().min(8).max(20),
  password: z.string().min(6).max(100),
  role: z.enum(['user', 'worker', 'admin']).optional(),
});

router.post('/signup', async (req, res) => {
  try {
    const { phone, name, email, password, role: desiredRole, adminSecret } = signupSchema.parse(req.body);
    const existing = await query('SELECT id FROM users WHERE phone = ?', [phone]);
    if (existing.length) return res.status(409).json({ error: 'Phone already registered' });

    // Determine role
    let role = desiredRole ?? 'user';
    if (role === 'admin') {
      if (!process.env.ADMIN_SIGNUP_SECRET || adminSecret !== process.env.ADMIN_SIGNUP_SECRET) {
        return res.status(403).json({ error: 'Admin signup not allowed' });
      }
    }
    if (!['user', 'worker', 'admin'].includes(role)) role = 'user';

    const hash = await bcrypt.hash(password, 10);
    const result = await query(
      'INSERT INTO users (phone, name, email, role, password_hash) VALUES (?, ?, ?, ?, ?)',
      [phone, name ?? null, email ?? null, role, hash]
    );
    const userId = result.insertId;
    const userRows = await query('SELECT id, phone, name, email, role, created_at AS createdAt, updated_at AS updatedAt FROM users WHERE id = ?', [userId]);
    const user = userRows[0];
    const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post('/signin', async (req, res) => {
  try {
    const { phone, password, role: requiredRole } = signinSchema.parse(req.body);
    const rows = await query('SELECT id, phone, name, email, role, password_hash FROM users WHERE phone = ?', [phone]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    const row = rows[0];
    const ok = await bcrypt.compare(password, row.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    if (requiredRole && row.role !== requiredRole) {
      return res.status(403).json({ error: 'Role mismatch' });
    }
    const user = { id: row.id, phone: row.phone, name: row.name, email: row.email, role: row.role };
    const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
