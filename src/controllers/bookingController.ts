import { Request, Response } from 'express';
import { bookSeatAtomically } from '../services/bookingService';

export const handleBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { seatId, email } = req.body;
    
    // Validasi sederhana
    if(!seatId || !email) {
        res.status(400).json({ error: "SeatId dan Email wajib diisi" });
        return;
    }

    const result = await bookSeatAtomically(seatId, email);
    
    res.status(200).json({
      success: true,
      message: "Booking berhasil! Tiket milik Anda.",
      data: result
    });

  } catch (error: any) {
    // Menangani error Race Condition secara spesifik
    const isRaceCondition = error.message.includes('RACE_CONDITION');
    
    // Jika Race Condition, return 409 (Conflict), selain itu 400 (Bad Request)
    res.status(isRaceCondition ? 409 : 400).json({
      success: false,
      error: error.message
    });
  }
};