import express from 'express';
import { query } from '../lib/db.js';

const router = express.Router();

router.get('/stats', async (req, res) => {
  try {
    const [usersCountRow] = await query('SELECT COUNT(*) AS cnt FROM users');
    const [workshopsCountRow] = await query('SELECT COUNT(*) AS cnt FROM workshops');

    const statusRows = await query(
      `SELECT status, COUNT(*) AS cnt
         FROM service_requests
        GROUP BY status`
    );
    const statusCounts = statusRows.reduce((acc, r) => { acc[r.status] = Number(r.cnt); return acc; }, {});

    const recentRequests = await query(
      `SELECT sr.id, sr.service, sr.status, sr.created_at AS createdAt, u.phone AS userPhone, w.name AS workshopName
         FROM service_requests sr
         LEFT JOIN users u ON u.id = sr.userId
         LEFT JOIN workshops w ON w.id = sr.workshopId
        ORDER BY sr.created_at DESC
        LIMIT 10`
    );

    res.json({
      data: {
        totals: {
          users: Number(usersCountRow?.cnt ?? 0),
          workshops: Number(workshopsCountRow?.cnt ?? 0),
          requests: statusRows.reduce((sum, r) => sum + Number(r.cnt), 0),
        },
        requestsByStatus: statusCounts,
        recentRequests: recentRequests.map(r => ({
          id: Number(r.id),
          service: r.service,
          status: r.status,
          createdAt: r.createdAt,
          userPhone: r.userPhone ?? null,
          workshopName: r.workshopName ?? null,
        })),
      },
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
