import express from 'express';
import { prisma } from '../lib/prisma.js';
import twilio from 'twilio';

const router = express.Router();
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

router.get('/', async (req, res) => {
  const userId = Number(req.query.userId);
  const notifications = await prisma.notification.findMany({
    where: userId ? { userId } : {},
    orderBy: { createdAt: 'desc' },
  });
  res.json({ data: notifications });
});

router.post('/', async (req, res) => {
  const { userId, title, message, type = 'general' } = req.body;
  if (!userId || !message) return res.status(400).json({ error: 'userId and message required' });

  const notif = await prisma.notification.create({ data: { userId, title, message, type } });

  // optional SMS
  if (process.env.NOTIFY_VIA_TWILIO === 'true' && twilioClient && process.env.TWILIO_FROM_NUMBER) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.phone) {
      try {
        await twilioClient.messages.create({
          body: message,
          to: user.phone,
          from: process.env.TWILIO_FROM_NUMBER,
        });
      } catch (e) {
        console.warn('Twilio SMS failed:', e.message);
      }
    }
  }

  res.status(201).json({ data: notif });
});

router.post('/:id/read', async (req, res) => {
  const id = Number(req.params.id);
  const updated = await prisma.notification.update({ where: { id }, data: { isRead: true } });
  res.json({ data: updated });
});

export default router;
