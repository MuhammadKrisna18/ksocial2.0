# K-Social 2.0

Platform media sosial fullstack modern yang dibangun dengan **SvelteKit (Svelte 5 Runes)**, **Tailwind CSS v4**, dan **PostgreSQL (Drizzle ORM)**. Mengimplementasikan **Clean Architecture** dan **Domain-Driven Design (DDD)** untuk skalabilitas tinggi, pemisahan dependensi yang ketat, dan kemudahan pemeliharaan kode.

---

## 🚀 Memulai Development

### Prasyarat
- **Node.js** >= 20
- **PostgreSQL** >= 15 (default port: `5432` atau `6543` sesuai file `.env`)

### Instalasi & Setup Database

```bash
# 1. Install dependencies
npm install

# 2. Salin environment variable & sesuaikan kredensial database
cp .env.example .env

# 3. Sinkronisasi skema Drizzle & jalankan database seeder
npm run db:push
npm run db:seed
```

> **Akun Pengujian Bawaan (dari Seeder):**
> - **Admin**: `admin.ksocial.sveltekit@admin.co.id` (Password: `admin.ksocial.sveltekit`)
> - **User 1**: `user1@example.com` (Password: `password123`)
> - **User 2**: `user2@example.com` (Password: `password123`)
> - **User 3**: `user3@example.com` (Password: `password123`)
> - **User 4**: `user4@example.com` (Password: `password123`)
> - **User 5**: `user5@example.com` (Password: `password123`)

### Menjalankan Server
```bash
npm run dev -- --open
```
Server pengembangan akan aktif di `http://localhost:5173`.

---

## 🛠️ Tech Stack & Arsitektur

### 🖥️ Frontend
- **Framework**: [SvelteKit 2](https://kit.svelte.dev/) dengan **Svelte 5 Runes** (`$state`, `$derived`, `$props`, `$effect`).
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) dengan estetika modern (*Dark/Light Mode*, *Glassmorphism*, mikro-animasi, responsive layout mobile & desktop).
- **Audio & Media**: Synthesized Audio berbasis Web Audio API browser (notifikasi nada dering ringan tanpa dependensi aset eksternal) dan CropperJS untuk pemotongan foto.

### ⚙️ Backend (Clean Architecture & DDD)
Arsitektur backend mematuhi prinsip **The Dependency Rule** di mana lapisan dalam tidak pernah bergantung pada lapisan luar:

```
[ Presentation / Delivery Layer ]
  (SvelteKit Routes: +page.server.ts, +server.ts, hooks.server.ts)
                 │
                 ▼
    [ Composition Root: container.ts ]
                 │
                 ▼
     [ Application Layer ]
       ├── Use Cases (Single Responsibility)
       ├── Domain Event Handlers
       ├── Application Interfaces & DTOs
       └── Custom Exceptions (ValidationError, NotFoundError, dll.)
                 │
                 ▼
        [ Domain Layer ]  <── Core Business Logic (100% Bebas Dependensi Eksternal)
          ├── Entities (User, Post, Comment, Message, Follow, Notification)
          ├── Value Objects (Email, Username, RoleName)
          ├── Domain Events (MessageSentEvent, PostLikedEvent, dll.)
          └── Repository Interfaces (IUserRepository, IMessageRepository, dll.)
                 ▲
                 │ (Inversion of Control)
     [ Infrastructure Layer ]
       ├── Drizzle Repositories (DrizzleUserRepository, DrizzleMessageRepository, dll.)
       ├── Database Client & Drizzle ORM Schema (PostgreSQL)
       ├── DomainEventDispatcher (Event Bus)
       ├── HashService & TokenService (JWT, Argon2/Bcrypt)
       └── LocalFileStorage
```

---

## ✨ Fitur Utama

### 💬 1. Real-Time Chat & Direct Messaging (`/user/messages`)
- **Server-Sent Events (SSE) Streaming**: Komunikasi pesan real-time instan melalui `/api/chat/stream`.
- **Floating Toast Notification**: Pop-up notifikasi melayang di pojok kanan atas saat ada pesan masuk, lengkap dengan foto profil pengirim, cuplikan pesan, dan tombol cepat *"Buka Obrolan"*.
- **Synthesized Notification Chime**: Efek nada dering lembut (*two-tone sine chime*) via Web Audio API browser saat pesan masuk.
- **Dynamic Sidebar Unread Badge**:
  - Badge merah berdenyut (`animate-pulse`) di samping menu **Messages** pada sidebar kiri yang menampilkan jumlah pesan belum dibaca secara real-time.
  - Jumlah badge otomatis berkurang atau hilang seketika saat percakapan dengan kontak tersebut dibuka.
- **Manajemen Kontak & Obrolan**:
  - Daftar kontak percakapan yang diurutkan berdasarkan pesan terbaru.
  - Memulai chat langsung dengan teman dari daftar teman (*Friends*).
  - Sinkronisasi status pesan terbaca (`is_read`) secara asinkron via `PATCH /api/chat/[userId]`.
  - Kontrol privasi pesan: Opsi akun untuk hanya menerima pesan dari pengguna yang sudah saling berteman (*Friends*).

### 👥 2. Hubungan Sosial & Pertemanan (Follow System)
- **Follow / Unfollow**: Mengikuti pengguna lain dengan update status instan.
- **Mutual Follow (Friends)**: Jika dua akun saling mengikuti, status relasi otomatis menjadi **Friends** (Teman).
- **Akun Privat (Follow Request)**:
  - Jika akun diatur sebagai *Private*, permintaan pertemanan memerlukan persetujuan (*Accept* atau *Reject*) dari pemilik akun melalui tab Notifikasi.
  - Postingan akun privat disembunyikan dari pengguna yang belum disetujui.

### 📝 3. Feed & Manajemen Postingan Interaktif
- **Pembuatan Postingan**: Mendukung konten teks dan multi-media gambar.
- **Interaksi Post**: Like optimistik, share link postingan, dan hapus postingan milik sendiri.
- **Sistem Bookmark / Saved**: Menyimpan postingan atau komentar ke tab **Saved** (`/user/saved`) dengan tampilan bertab. Terhubung relasi cascade (otomatis terhapus jika post asli dihapus).
- **Komentar Bertingkat (Nested Comments)**:
  - Fitur balas komentar dengan otomatis menambahkan *mention* `@username` di kolom input.
  - Suka (*Like*), simpan (*Save*), dan hapus komentar secara mandiri.

### 🔔 4. Notifikasi Terpusat
- Notifikasi terpusat untuk aktivitas: permintaan pertemanan (*Follow Requested*), persetujuan (*Follow Accepted*), Like postingan, dan komentar baru.
- Penanganan event berbasis *Domain Event Dispatcher* terpisah dari alur utama (*decoupled event handlers*).

### 🔍 5. Pencarian Global & Profil Pengguna
- **Pencarian Pengguna**: Kolom pencarian di navbar atas dengan debounce untuk menemukan pengguna berdasarkan nama atau username.
- **Halaman Profil Dinamis (`/user/[username]`)**: Menampilkan biografi, jumlah followers/following, postingan pengguna, serta status privasi.
- **Edit Profil Interaktif**: Pengubahan biodata, status hubungan, lokasi, serta pemotongan foto profil & sampul (*CropperJS*).

### 🛡️ 6. Autentikasi, Otorisasi, & Keamanan (RBAC)
- Autentikasi berbasis **JWT** yang disimpan dalam **HTTP-Only Cookies**.
- **Role-Based Access Control (RBAC)** yang memisahkan akses peran `admin` (`/admin`) dan `user` (`/user`).
- **Middleware Guard (`hooks.server.ts`)**: Pendekatan proteksi rute *deny-by-default* dengan auto-redirect sesuai role pengguna.
- Sanitasi input dan proteksi password hashing aman.

---

## 📦 Skrip & Perintah Penting

| Perintah | Deskripsi |
|---|---|
| `npm run dev` | Menjalankan local dev server dengan hot reload |
| `npm run build` | Membuat bundle build produksi |
| `npm run preview` | Menjalankan preview build produksi |
| `npm run check` | Memeriksa type-safety TypeScript dan validasi Svelte (0 errors) |
| `npm run lint` | Menjalankan ESLint untuk pemeriksaan gaya kode |
| `npm run format` | Menjalankan Prettier untuk merapikan format kode |
| `npm run db:push` | Menyinkronkan skema database Drizzle ke PostgreSQL |
| `npm run db:studio` | Membuka Drizzle Studio (GUI browser untuk database) |
| `npm run db:seed` | Menjalankan data seeding awal |

---

## 📂 Struktur Direktori Proyek

```
ksocial2.0/
├── src/
│   ├── lib/
│   │   ├── domain/               # 🏛️ Domain Layer: Entities, Value Objects, Events, Interfaces
│   │   │   ├── entities/
│   │   │   ├── events/
│   │   │   ├── repositories/
│   │   │   └── value-objects/
│   │   ├── application/          # ⚙️ Application Layer: Use Cases, Event Handlers, DTOs, Exceptions
│   │   │   ├── event-handlers/
│   │   │   ├── exceptions/
│   │   │   ├── interfaces/
│   │   │   └── use-cases/
│   │   ├── infrastructure/       # 🔌 Infrastructure Layer: Drizzle Repositories, Database, Services, DI Container
│   │   │   ├── config/           # Composition Root (container.ts)
│   │   │   ├── database/         # Drizzle client & PostgreSQL schemas
│   │   │   ├── events/           # DomainEventDispatcher
│   │   │   ├── external-services/# HashService, TokenService
│   │   │   ├── repositories/     # Concrete Drizzle Repositories
│   │   │   └── storage/          # LocalFileStorage
│   │   └── presentation/         # 🎨 Presentation Layer: Shared UI Stores, Utilities
│   │       ├── stores/           # Global Stores (chatState.svelte.ts)
│   │       └── utils/            # Response & error handling helpers
│   ├── routes/                   # 🌐 SvelteKit Routing & Endpoints
│   │   ├── (auth)/               # Login & Register Form Actions
│   │   ├── admin/                # Admin Panel Dashboard
│   │   ├── api/                  # API Endpoints (/api/chat, /api/posts, /api/search, dll.)
│   │   └── user/                 # User App (Feed, Messages, Friends, Profile, Settings)
│   └── hooks.server.ts           # Server middleware & JWT token authentication guard
├── static/                       # Aset publik & folder upload media lokal
├── drizzle.config.ts             # Konfigurasi Drizzle ORM
└── package.json
```

---

## 📄 Lisensi
Proyek ini dibuat dan dikembangkan untuk keperluan pengembangan platform media sosial modern K-Social.
