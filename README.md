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
  - **Domain Layer**: Logika inti, *Entities* (ex: `User`, `Post`, `Follow`), dan *Value Objects* (ex: `Email`, `Username`, `RoleName`).
  - **Application Layer**: Penanganan *Use Case* (ex: `LoginUseCase`, `FollowUserUseCase`) dan *Interfaces* kontrak.
  - **Infrastructure Layer**: Interaksi dengan dunia luar. Menggunakan **Drizzle ORM** untuk **PostgreSQL**, kriptografi, JWT, Local File Storage, dan *Dependency Injection (DI) Container* manual.
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
  - **Beranda (Feed)**: Layout *feed* interaktif.
  - **Profil Dinamis (`/user/[username]`)**: Halaman profil publik yang menampilkan detail *user* beserta riwayat *postingan*-nya. Mendukung fitur **Privasi** (menampilkan status "Privat" dan menyembunyikan postingan jika tidak saling berteman).
  - **Edit Profil Interaktif**: Pengubahan data diri, checkbox privasi, serta pemotongan (*cropping*) Foto Profil dan Sampul langsung di sisi klien menggunakan CropperJS.
  - **Notifikasi**: Sistem notifikasi langsung (khususnya untuk *Follow Request*) yang terintegrasi di halaman profil pribadi pengguna.

### ⚙️ Backend, Postingan, & Relasi
- **Manajemen Postingan Lengkap**:
  - **Create Post**: Membuat postingan dengan fitur upload media multi-gambar dengan modal *popup*.
  - **Delete Post**: Menghapus postingan milik sendiri langsung dari titik tiga pada *Post Card*.
  - **Like & Share Post**: Fitur suka postingan secara optimistik dan menyalin tautan postingan.
  - **Save Post & Comment**: Menyimpan postingan atau komentar ke tab "Saved" yang terbagi secara rapi (Tabbed View). Jika postingan asli dihapus, ia otomatis terhapus dari daftar _Saved_ pengguna lain (Cascade).
- **Sistem Komentar Bertingkat (Nested Comments)**:
  - **Balas Komentar**: Fitur membalas komentar yang otomatis melakukan *mention* `@username` di dalam textarea input balasan. Layout menjorok yang diratakan ke satu level demi menjaga kerapian antar muka UI.
  - **Interaksi Komentar**: Suka (*Like*), Simpan (*Save*), dan Hapus (*Delete*) komentar secara individual. Otorisasi hapus hanya berlaku untuk penulis komentar.
- **Sistem Pertemanan (Follow System)**:
  - **Follow / Unfollow**: Mengikuti pengguna lain.
  - **Mutual Follow (Friends)**: Jika dua akun saling mem-*follow*, status otomatis berubah menjadi **Friends**.
  - **Akun Private (Follow Request)**: Jika sebuah akun diset menjadi *Private*, orang yang mem-*follow* harus mendapatkan persetujuan (*Accept/Reject*) via notifikasi terlebih dahulu.
- **Upload File (Local File Storage)**: Mengelola unggahan foto postingan dan avatar, mendukung segala format gambar standar.
- **Autentikasi & Otorisasi**:
  - Sistem Login dan Pendaftaran aman berbasis JWT & HTTP-Only Cookie.
  - **Role-Based Access Control (RBAC)**: Sistem memisahkan antara `admin` dan `user`.
- **Proteksi Router (Deny-by-Default)**: 
  - Hanya rute publik (`/login`, `/register`) yang bebas diakses, sisanya dilindungi dan diredirect otomatis sesuai peran.

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
| `npm run check` | Memeriksa tipe data Typescript dan Svelte (SSR) |
