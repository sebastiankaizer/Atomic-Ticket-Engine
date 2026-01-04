# Atomic Ticket Engine 🎟️

![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=nodedotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748?style=for-the-badge&logo=prisma)
![Docker](https://img.shields.io/badge/Docker-25.x-2496ED?style=for-the-badge&logo=docker)

> **Backend High-Performance untuk Sistem Ticketing Event**  
> Mencegah *Double Booking* pada trafik tinggi menggunakan teknik **Optimistic Locking** dan transaksi database ACID.

---

## 🛑 Masalah: The Double Booking Problem

Dalam penjualan tiket konser populer (war tiket), ribuan pengguna mencoba memesan satu kursi yang sama dalam waktu milidetik yang berdekatan.

**Skenario Tanpa Proteksi (Race Condition):**
1. User A membaca status kursi A1: `AVAILABLE`.
2. User B membaca status kursi A1: `AVAILABLE` (hampir bersamaan).
3. User A melakukan pembayaran -> Status update `BOOKED`.
4. User B melakukan pembayaran -> Status update `BOOKED` (menimpa User A).
   
**Hasilnya:** Satu kursi terjual ke dua orang. Ini fatal.

## 🛡️ Solusi: Optimistic Locking

Sistem ini menerapkan **Optimistic Locking** menggunakan version control di level database.

Setiap baris data kursi memiliki kolom `version`.
Logika Transaksi (lihat `src/services/bookingService.ts`):

1. **Read**: Baca data kursi beserta nomor `version`-nya (misal: v1).
2. **Atomic Update**:
   ```sql
   UPDATE Seat 
   SET status = 'BOOKED', version = version + 1
   WHERE id = {id} AND version = {v1}
   ```
3. **Verify**:
   - Jika ada user lain yang mengubah data duluan, `version` di database sudah berubah menjadi v2.
   - Query update kita akan gagal (0 baris terupdate) karena kondisi `WHERE version = v1` tidak terpenuhi.
   - Sistem melempar error `RACE_CONDITION`.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js & TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma (Type-safe database client)
- **Containerization**: Docker & Docker Compose
- **Framework**: Express.js

---

## 🚀 Cara Install & Menjalankan

Ikuti langkah ini untuk menjalankan project secara lokal.

### Prasyarat
- Node.js (v18+)
- Docker Desktop (Running)

### 1. Clone Repository
```bash
git clone https://github.com/username/Atomic-Ticket-Engine.git
cd Atomic-Ticket-Engine
```

### 2. Install Dependensi
```bash
npm install
```

### 3. Setup Database (Docker)
Jalankan PostgreSQL menggunakan Docker Compose:
```bash
docker-compose up -d
```

### 4. Setup Prisma Schema
Push schema database ke PostgreSQL lokal dan generate client:
```bash
npx prisma db push
```

### 5. Seeding Data Awal
Isi database dengan data dummy (Event Coldplay & Kursi):
```bash
npm run seed
```
_Output:_ `✅ Event created: Coldplay Jakarta 2026`

### 6. Jalankan Server
```bash
npm run dev
```
Server berjalan di `http://localhost:3000`

---

## 📡 Dokumentasi API

### 1. Booking Tiket (Atomic)
Endpoint ini menangani pembelian tiket dengan proteksi race condition.

- **URL**: `/api/book`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "seatId": 1,
    "email": "user@example.com"
  }
  ```

**Responses:**

| Status Code | Kondisi | Keterangan |
|-------------|---------|------------|
| `200 OK` | Berhasil | `{ "success": true, "data": { ... } }` |
| `409 Conflict` | Race Condition | Gagal karena kursi baru saja diambil orang lain. |
| `400 Bad Request` | Validasi / Sold | Kursi tidak valid atau sudah `BOOKED` sejak awal. |

### 2. List Event & Kursi
Melihat daftar acara dan status ketersediaan kursi.

- **URL**: `/api/events`
- **Method**: `GET`

---

## 🧪 Cara Pengujian (Concurrency Test)

Untuk membuktikan fitur anti-bentrok, kita bisa mensimulasikan "serangan" trafik tinggi.

1. Pastikan server berjalan dan database sudah di-reset (`npm run seed`).
2. Buat script sederhana atau gunakan `curl` untuk mengirim request bersamaan.

**Contoh Logic Test:**
Kirim 5 request HAMPIR BERSAMAAN untuk memesan `seatId: 3` (Kursi Rebutan).

**Ekspektasi Hasil:**
- **1 Request** berhasil (`200 OK`).
- **4 Request** gagal (`409 Conflict`) dengan pesan `RACE_CONDITION`.

Ini membuktikan bahwa sistem berhasil menjaga integritas data tiket.

---

## 👤 Author

**Kevin**  
*Backend Developer*

Portofolio Project: Atomic Ticket Engine
