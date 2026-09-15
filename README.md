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

*(Catatan: Akun admin default yang terbuat dari seeder adalah `admin.ksocial.sveltekit@admin.co.id` dengan password `admin.ksocial.sveltekit`. Ada juga 2 akun user tambahan untuk testing: `user1@example.com` & `user2@example.com`)*

### Menjalankan Server
```bash
npm run dev -- --open
```

---

## 🛠️ Tech Stack & Arsitektur



### 🖥️ Arsitektur Frontend
- **Framework**: SvelteKit 2 dengan Svelte 5 (Client-Side & Server-Side Rendering Hybrid).
- **Styling**: Tailwind CSS v4 dengan pendekatan UI Modern (Glassmorphism, animasi interaktif, *responsive design*).
- **Struktur**: Pemisahan tata letak (Layout) secara modular (contoh: *routing* terpisah untuk `/user`, `/admin`, dan `/(auth)`).

### ⚙️ Arsitektur Backend
- **Platform**: Node.js (dijalankan via SvelteKit Server Endpoints & Hooks).
- **Pola Arsitektur**: **Clean Architecture** (Solid Principles).
  - **Domain Layer**: Logika inti, *Entities* (ex: `User`), dan *Value Objects* (ex: `Email`, `Username`, `RoleName`).
  - **Application Layer**: Penanganan *Use Case* (ex: `LoginUseCase`, `RegisterUseCase`) dan *Interfaces* kontrak.
  - **Infrastructure Layer**: Interaksi dengan dunia luar. Menggunakan **Drizzle ORM** untuk **PostgreSQL**, kriptografi, JWT, dan *Dependency Injection (DI) Container* manual.
  - **Presentation Layer**: Menangani antarmuka sistem (HTTP Request, Cookie, Router) yang diintegrasikan langsung pada SvelteKit Server.

---

## ✨ Fitur yang Sudah Selesai

### 🖥️ Frontend (UI/UX)
- **Desain Premium**: Menggunakan estetika modern seperti *Glassmorphism*, gradien halus, bayangan, dan animasi interaktif.
- **Halaman Autentikasi**: 
  - Halaman **Login** dengan penanganan *error* responsif, serta **Tombol Quick Login** untuk mempercepat _testing_.
  - Halaman **Register** dengan layout yang rapi dan penanda input visual.
- **Dashboard Admin**: Halaman khusus admin dengan navigasi dan tata letak eksklusif.
- **Dashboard User**: 
  - **Beranda (Feed)**: Layout *feed* interaktif dengan fitur pembuatan postingan (*Create Post*) yang terhubung ke _database_.
  - **Profil Pengguna**: Halaman profil dinamis (contoh: `/user/profile/username`) yang menampilkan detail *user* beserta riwayat *postingan*-nya. Mendukung fitur **Privasi** (menampilkan status "Privat" jika tidak dapat diakses).
  - **Teman (Friends)**: Daftar pengguna (selain admin) dengan antarmuka _grid_ modern, *avatar* bergradasi, dan tautan menuju profil masing-masing pengguna.
  - **Pengaturan (Settings)**: Pengelolaan preferensi seperti fitur *toggle* **Akun Privat** dengan *Confirmation Modal* responsif tanpa _reload_ halaman (menggunakan Svelte Actions).

### ⚙️ Backend & Keamanan
- **Fitur Fungsional Selesai**:
  - **CRUD Postingan**: Implementasi penuh pembuatan _post_, pengambilan *feed*, penyimpanan UUID berbasis *Crypto*, dan relasi *Post-to-User* via PostgreSQL.
  - **Sistem Privasi Akun**: Field `is_private` ditambahkan di *database* yang langsung terintegrasi dengan UseCase dan Handler (menyembunyikan *feed* dari *user* asing jika diaktifkan).
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
