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

## 📦 Scripts Penting

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Menjalankan server pengembangan |
| `npm run build` | Melakukan build untuk produksi |
| `npm run db:push` | Mendorong skema ke database lokal |
| `npm run db:studio` | Membuka antarmuka GUI untuk melihat isi database |
| `npm run db:seed` | Menambahkan data awal (seperti akun Admin) |
| `npm run lint` / `format` | Merapikan dan mengecek penulisan kode |
