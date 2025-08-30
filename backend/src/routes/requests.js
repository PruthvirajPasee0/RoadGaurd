import express from 'express';
import { z } from 'zod';
import { query } from '../lib/db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

const allowedStatuses = ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'];

// List requests with optional filters: userId, workshopId, status
router.get('/', async (req, res) => {
  try {
    const { userId, workshopId, status } = req.query;

    const where = [];
    const params = [];
    if (userId) { where.push('sr.userId = ?'); params.push(Number(userId)); }
    if (workshopId) { where.push('sr.workshopId = ?'); params.push(Number(workshopId)); }
    if (status) { where.push('sr.status = ?'); params.push(String(status)); }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const rows = await query(
      `SELECT sr.id, sr.userId, sr.workshopId, sr.service, sr.status, sr.vehicle_make AS vehicleMake, sr.vehicle_model AS vehicleModel,
              sr.vehicle_year AS vehicleYear, sr.registration_number AS registrationNumber, sr.location_address AS locationAddress,
              sr.lat, sr.lng, sr.notes, sr.urgency, sr.created_at AS createdAt, sr.updated_at AS updatedAt,
              w.name AS workshopName
         FROM service_requests sr
         LEFT JOIN workshops w ON w.id = sr.workshopId
         ${whereSql}
         ORDER BY sr.created_at DESC`,
      params
    );

    const data = rows.map(r => ({
      id: Number(r.id),
      userId: Number(r.userId),
      workshopId: r.workshopId != null ? Number(r.workshopId) : null,
      workshopName: r.workshopName ?? null,
      service: r.service,
      status: r.status,
      vehicleMake: r.vehicleMake ?? null,
      vehicleModel: r.vehicleModel ?? null,
      vehicleYear: r.vehicleYear ?? null,
      registrationNumber: r.registrationNumber ?? null,
      locationAddress: r.locationAddress ?? null,
      lat: r.lat != null ? Number(r.lat) : null,
      lng: r.lng != null ? Number(r.lng) : null,
      notes: r.notes ?? null,
      urgency: r.urgency ?? 'normal',
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    res.json({ data });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Update status (worker/admin only), and log history
router.patch('/:id/status', requireAuth, requireRole('worker', 'admin'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body || {};
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const rows = await query('SELECT id, workshopId, status FROM service_requests WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    const reqRow = rows[0];

    // If worker, ensure they are assigned to this workshop
    if (req.user.role === 'worker') {
      if (!reqRow.workshopId) {
        return res.status(403).json({ error: 'Request not linked to any workshop' });
      }
      const wa = await query(
        'SELECT id FROM worker_assignments WHERE userId = ? AND workshopId = ? AND active = 1 LIMIT 1',
        [Number(req.user.id), Number(reqRow.workshopId)]
      );
      if (!wa.length) return res.status(403).json({ error: 'Forbidden' });
    }

    if (reqRow.status === status) {
      // No-op, return current data
    } else {
      await query('UPDATE service_requests SET status = ? WHERE id = ?', [status, id]);
      await query(
        'INSERT INTO request_status_history (requestId, from_status, to_status, changedByUserId) VALUES (?, ?, ?, ?)',
        [id, reqRow.status, status, Number(req.user.id)]
      );
    }

    const outRows = await query(
      `SELECT sr.id, sr.userId, sr.workshopId, sr.service, sr.status, sr.vehicle_make AS vehicleMake, sr.vehicle_model AS vehicleModel,
              sr.vehicle_year AS vehicleYear, sr.registration_number AS registrationNumber, sr.location_address AS locationAddress,
              sr.lat, sr.lng, sr.notes, sr.urgency, sr.created_at AS createdAt, sr.updated_at AS updatedAt,
              w.name AS workshopName
         FROM service_requests sr
         LEFT JOIN workshops w ON w.id = sr.workshopId
        WHERE sr.id = ?`,
      [id]
    );

    const r = outRows[0];
    const data = {
      id: Number(r.id),
      userId: Number(r.userId),
      workshopId: r.workshopId != null ? Number(r.workshopId) : null,
      workshopName: r.workshopName ?? null,
      service: r.service,
      status: r.status,
      vehicleMake: r.vehicleMake ?? null,
      vehicleModel: r.vehicleModel ?? null,
      vehicleYear: r.vehicleYear ?? null,
      registrationNumber: r.registrationNumber ?? null,
      locationAddress: r.locationAddress ?? null,
      lat: r.lat != null ? Number(r.lat) : null,
      lng: r.lng != null ? Number(r.lng) : null,
      notes: r.notes ?? null,
      urgency: r.urgency ?? 'normal',
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };

    res.json({ data });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

const createSchema = z.object({
  userId: z.number().int().positive(),
  workshopId: z.number().int().positive().optional().nullable(),
  service: z.string().min(2).max(100),
  vehicleMake: z.string().optional().nullable(),
  vehicleModel: z.string().optional().nullable(),
  vehicleYear: z.string().optional().nullable(),
  registrationNumber: z.string().optional().nullable(),
  locationAddress: z.string().optional().nullable(),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
  notes: z.string().optional().nullable(),
  urgency: z.enum(['low', 'normal', 'high']).optional().default('normal'),
});

router.post('/', async (req, res) => {
  try {
    // Accept numeric strings too
    const parsed = createSchema.safeParse({
      ...req.body,
      userId: req.body.userId != null ? Number(req.body.userId) : undefined,
      workshopId: req.body.workshopId != null && req.body.workshopId !== '' ? Number(req.body.workshopId) : null,
      lat: req.body.lat != null && req.body.lat !== '' ? Number(req.body.lat) : null,
      lng: req.body.lng != null && req.body.lng !== '' ? Number(req.body.lng) : null,
    });
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues?.[0]?.message || 'Invalid body' });
    }
    const {
      userId, workshopId, service, vehicleMake, vehicleModel, vehicleYear,
      registrationNumber, locationAddress, lat, lng, notes, urgency,
    } = parsed.data;

    const result = await query(
      `INSERT INTO service_requests (userId, workshopId, service, status, vehicle_make, vehicle_model, vehicle_year,
                                     registration_number, location_address, lat, lng, notes, urgency)
       VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, workshopId ?? null, service, vehicleMake ?? null, vehicleModel ?? null, vehicleYear ?? null,
       registrationNumber ?? null, locationAddress ?? null, lat ?? null, lng ?? null, notes ?? null, urgency ?? 'normal']
    );

    const insertedId = result.insertId;
    const rows = await query(
      `SELECT sr.id, sr.userId, sr.workshopId, sr.service, sr.status, sr.vehicle_make AS vehicleMake, sr.vehicle_model AS vehicleModel,
              sr.vehicle_year AS vehicleYear, sr.registration_number AS registrationNumber, sr.location_address AS locationAddress,
              sr.lat, sr.lng, sr.notes, sr.urgency, sr.created_at AS createdAt, sr.updated_at AS updatedAt,
              w.name AS workshopName
         FROM service_requests sr
         LEFT JOIN workshops w ON w.id = sr.workshopId
        WHERE sr.id = ?`,
      [insertedId]
    );

    const r = rows[0];
    const data = {
      id: Number(r.id),
      userId: Number(r.userId),
      workshopId: r.workshopId != null ? Number(r.workshopId) : null,
      workshopName: r.workshopName ?? null,
      service: r.service,
      status: r.status,
      vehicleMake: r.vehicleMake ?? null,
      vehicleModel: r.vehicleModel ?? null,
      vehicleYear: r.vehicleYear ?? null,
      registrationNumber: r.registrationNumber ?? null,
      locationAddress: r.locationAddress ?? null,
      lat: r.lat != null ? Number(r.lat) : null,
      lng: r.lng != null ? Number(r.lng) : null,
      notes: r.notes ?? null,
      urgency: r.urgency ?? 'normal',
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };

    res.status(201).json({ data });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const rows = await query(
      `SELECT sr.id, sr.userId, sr.workshopId, sr.service, sr.status, sr.vehicle_make AS vehicleMake, sr.vehicle_model AS vehicleModel,
              sr.vehicle_year AS vehicleYear, sr.registration_number AS registrationNumber, sr.location_address AS locationAddress,
              sr.lat, sr.lng, sr.notes, sr.urgency, sr.created_at AS createdAt, sr.updated_at AS updatedAt,
              w.name AS workshopName
         FROM service_requests sr
         LEFT JOIN workshops w ON w.id = sr.workshopId
        WHERE sr.id = ?`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });

    const r = rows[0];
    const data = {
      id: Number(r.id),
      userId: Number(r.userId),
      workshopId: r.workshopId != null ? Number(r.workshopId) : null,
      workshopName: r.workshopName ?? null,
      service: r.service,
      status: r.status,
      vehicleMake: r.vehicleMake ?? null,
      vehicleModel: r.vehicleModel ?? null,
      vehicleYear: r.vehicleYear ?? null,
      registrationNumber: r.registrationNumber ?? null,
      locationAddress: r.locationAddress ?? null,
      lat: r.lat != null ? Number(r.lat) : null,
      lng: r.lng != null ? Number(r.lng) : null,
      notes: r.notes ?? null,
      urgency: r.urgency ?? 'normal',
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };

    res.json({ data });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
