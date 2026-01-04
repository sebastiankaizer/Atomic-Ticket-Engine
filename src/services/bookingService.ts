import { prisma } from '../config/db';

export const bookSeatAtomically = async (seatId: number, email: string) => {
  // Kita mulai Transaksi Database (ACID)
  return await prisma.$transaction(async (tx) => {
    
    // 1. Cek status kursi saat ini
    const seat = await tx.seat.findUnique({ where: { id: seatId } });

    if (!seat) throw new Error('Kursi tidak ditemukan (404)');
    if (seat.status === 'BOOKED') throw new Error('Kursi sudah terjual (Sold Out)');

    // 2. KUNCI UTAMA: Update dengan pengecekan Version
    // Query ini hanya akan berhasil jika 'version' di database MASIH SAMA dengan yang kita baca di langkah 1.
    const updateResult = await tx.seat.updateMany({
      where: {
        id: seatId,
        version: seat.version // Guard: Pastikan versi belum berubah
      },
      data: {
        status: 'BOOKED',
        version: { increment: 1 } // Naikkan versi agar request lain gagal
      }
    });

    // 3. Jika updateResult.count == 0, artinya ada orang lain yang menyalip kita sepersekian detik lalu.
    if (updateResult.count === 0) {
      throw new Error('RACE_CONDITION: Kursi baru saja diambil orang lain!');
    }

    // 4. Jika berhasil update kursi, baru kita buat tiketnya
    const booking = await tx.booking.create({
      data: {
        seatId,
        userEmail: email
      }
    });

    return booking;
  });
};