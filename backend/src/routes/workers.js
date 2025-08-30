import express from 'express';
import { query } from '../lib/db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get the primary (or most recent) workshop for the logged-in worker
router.get('/me/workshop', requireAuth, requireRole('worker', 'admin'), async (req, res) => {
  try {
    const userId = Number(req.user.id);
    const rows = await query(
      `SELECT w.id, w.name, w.address, w.lat, w.lng, w.rating, w.reviews, w.isOpen, w.openTime, w.closeTime, w.services
         FROM worker_assignments wa
         JOIN workshops w ON w.id = wa.workshopId
        WHERE wa.userId = ? AND wa.active = 1
        ORDER BY wa.is_primary DESC, wa.assigned_at DESC
        LIMIT 1`,
      [userId]
    );
    if (!rows.length) return res.json({ data: null });
    const r = rows[0];
    let servicesArr = r.services;
    if (Buffer.isBuffer(servicesArr)) servicesArr = servicesArr.toString('utf8');
    if (typeof servicesArr === 'string') {
      try { servicesArr = JSON.parse(servicesArr); } catch (_) { servicesArr = []; }
    }
    const data = {
      id: Number(r.id),
      name: r.name,
      address: r.address,
      lat: Number(r.lat),
      lng: Number(r.lng),
      rating: r.rating != null ? Number(r.rating) : null,
      reviews: Number(r.reviews ?? 0),
      isOpen: r.isOpen === 1 || r.isOpen === true,
      openTime: r.openTime,
      closeTime: r.closeTime,
      services: Array.isArray(servicesArr) ? servicesArr : [],
    };
    res.json({ data });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
