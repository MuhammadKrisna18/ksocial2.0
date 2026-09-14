# K-Social 1.2

Platform sosial media fullstack yang dibangun dengan **SvelteKit**, **Tailwind CSS v4**, dan **PostgreSQL (Drizzle ORM)**. Mengadopsi **Clean Architecture** untuk kode yang rapi dan mudah di-*scale*.

---

## 🚀 Memulai Development

### Prasyarat
- Node.js >= 20
- PostgreSQL >= 15 (berjalan di port 6543)

### Instalasi & Setup Database

```bash
# 1. Install dependencies
npm install

# 2. Salin env dan sesuaikan jika perlu (database url, dll)
cp .env.example .env

# 3. Setup Database & Seed (Pastikan PostgreSQL sudah jalan)
npm run db:push
npm run db:seed
```

*(Catatan: Akun admin default yang terbuat dari seeder adalah `admin.ksocial.sveltekit@admin.co.id` dengan password `admin.ksocial.sveltekit`)*

### Menjalankan Server
```bash
npm run dev -- --open
```

---

## 🛠️ Tech Stack & Arsitektur

- **Frontend & Backend**: SvelteKit 2 + Svelte 5
- **Styling**: Tailwind CSS v4 (Glassmorphism & Modern UI)
- **Database**: PostgreSQL dengan Drizzle ORM
- **Autentikasi**: Custom JWT dengan cookie HTTP-only (RBAC Protected)
- **Arsitektur**: Clean Architecture (`domain` → `application` → `infrastructure` → `presentation`)

---

## ✨ Fitur yang Sudah Selesai

### 🖥️ Frontend (UI/UX)
- **Desain Premium**: Menggunakan estetika modern seperti *Glassmorphism*, gradien halus, bayangan, dan animasi interaktif.
- **Halaman Autentikasi**: 
  - Halaman **Login** dengan penanganan *error* responsif.
  - Halaman **Register** dengan layout yang rapi dan penanda input visual.
- **Dashboard Admin**: Halaman khusus admin dengan navigasi dan tata letak eksklusif.
- **Dashboard User**: Halaman utama pengguna dengan *sidebar*, *header*, tombol *create post*, dan susunan *feed* postingan sosial media yang interaktif (efek *hover* pada *Like*, *Comment*, *Share*).

### ⚙️ Backend & Keamanan
- **Arsitektur Rapi (Clean Architecture)**: Implementasi pemisahan tugas secara terstruktur (Entity, Value Object, Repository, Use Case) dengan *Dependency Injection* (DI) manual.
- **Autentikasi & Otorisasi**:
  - Sistem Login dan Pendaftaran aman berbasis JWT & HTTP-Only Cookie.
  - **Role-Based Access Control (RBAC)**: Sistem hanya memiliki dua peran pasti: `admin` dan `user` (Peran moderator telah dihapus).
- **Proteksi Router (Deny-by-Default)**: 
  - Hanya rute yang secara eksplisit didaftarkan sebagai publik (`/login`, `/register`) yang bisa diakses bebas.
  - *Fallback* rute statis untuk CSS/JS dilindungi agar tidak menyebabkan celah keamanan.
  - Otomatis mengalihkan *(redirect)* pengguna berdasarkan role-nya ketika login atau mengakses halaman terlarang.
- **Optimasi Database**: Solusi penanganan masalah *N+1 Query* pada pengambilan data banyak pengguna menggunakan fitur `inArray` dari Drizzle ORM.

---

## 📦 Scripts Penting

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Menjalankan server pengembangan |
| `npm run build` | Melakukan build untuk produksi |
| `npm run db:push` | Mendorong skema ke database lokal |
| `npm run db:studio` | Membuka antarmuka GUI untuk melihat isi database |
| `npm run db:seed` | Menambahkan data awal (seperti akun Admin) |
| `npm run lint` / `format` | Merapikan dan mengecek penulisan kode |
