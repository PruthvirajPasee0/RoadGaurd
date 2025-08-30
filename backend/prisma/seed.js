import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

function rand(min, max) { return Math.random() * (max - min) + min; }

async function main() {
  // Seed a couple of users
  await prisma.user.upsert({ where: { phone: '+911111111111' }, update: {}, create: { phone: '+911111111111', name: 'Admin', role: 'admin' } });
  await prisma.user.upsert({ where: { phone: '+912222222222' }, update: {}, create: { phone: '+912222222222', name: 'Worker', role: 'worker' } });

  // Seed workshops around Bengaluru (12.9716, 77.5946)
  const center = { lat: 12.9716, lng: 77.5946 };
  const servicesPool = ['Tire Change','Battery Jump','Fuel Delivery','Towing','Minor Repairs','Oil Change'];

  const toCreate = Array.from({ length: 25 }).map((_, i) => {
    const dLat = rand(-0.15, 0.15);
    const dLng = rand(-0.15, 0.15);
    const lat = center.lat + dLat;
    const lng = center.lng + dLng;
    const pick = servicesPool.sort(() => 0.5 - Math.random()).slice(0, 3 + Math.floor(Math.random()*3));
    return {
      name: `Garage ${i + 1}`,
      address: `Area ${i + 1}, Bengaluru`,
      lat, lng,
      rating: Number((3.5 + Math.random() * 1.5).toFixed(1)),
      reviews: Math.floor(Math.random() * 500),
      isOpen: Math.random() > 0.2,
      openTime: '09:00',
      closeTime: '21:00',
      services: pick,
    };
  });

  await prisma.workshop.createMany({ data: toCreate });
  console.log('Seed complete');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
