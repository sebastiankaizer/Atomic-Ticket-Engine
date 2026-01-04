import express from 'express';
import cors from 'cors';
import { handleBooking } from './controllers/bookingController';
import { prisma } from './config/db';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- ROUTES ---

// 1. API untuk Booking (Inti)
app.post('/api/book', handleBooking);

// 2. API untuk Cek Status Kursi (Bantu debug)
app.get('/api/events', async (req, res) => {
    try {
        const events = await prisma.event.findMany({ 
            include: { 
                seats: {
                    orderBy: { seatNo: 'asc' }
                } 
            } 
        });
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: "Gagal mengambil data event" });
    }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Atomic Engine running on port ${PORT}`);
});