import express from 'express';
import { query } from '../lib/db.js';

const router = express.Router();

function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

router.get('/', async (req, res) => {
  try {
    const { lat, lng, radiusKm, service } = req.query;

    // Fetch all workshops; optionally filter by service in JS for simplicity
    const rows = await query('SELECT id, name, address, lat, lng, rating, reviews, isOpen, openTime, closeTime, services FROM workshops');
    const all = rows.map(r => {
      let servicesArr = r.services;
      if (Buffer.isBuffer(servicesArr)) servicesArr = servicesArr.toString('utf8');
      if (typeof servicesArr === 'string') {
        try { servicesArr = JSON.parse(servicesArr); } catch (_) { servicesArr = []; }
      }
      return {
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
    });

    let list = all;
    if (service) {
      list = list.filter(w => (w.services || []).includes(service));
    }

    if (lat && lng && radiusKm) {
      const la = parseFloat(lat), lo = parseFloat(lng), r = parseFloat(radiusKm);
      list = list
        .map(w => ({ ...w, distanceKm: Number(haversineKm(la, lo, w.lat, w.lng).toFixed(2)) }))
        .filter(w => w.distanceKm <= r)
        .sort((a, b) => a.distanceKm - b.distanceKm);
    }

    res.json({ data: list });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const rows = await query('SELECT id, name, address, lat, lng, rating, reviews, isOpen, openTime, closeTime, services FROM workshops WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
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
