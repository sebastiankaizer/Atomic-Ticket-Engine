import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');
  
  // Hapus data lama agar bersih
  await prisma.booking.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.event.deleteMany();

  // Buat Event Baru
  const event = await prisma.event.create({
    data: {
      name: 'Coldplay Jakarta 2026',
      seats: {
        create: [
          { seatNo: 'A1' },
          { seatNo: 'A2' },
          { seatNo: 'A3' }, // Kursi rebutan
          { seatNo: 'B1' },
          { seatNo: 'B2' },
        ]
      }
    }
  });

  console.log(`✅ Event created: ${event.name}`);
  console.log(`✅ Seats generated: A1 - B2`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());