# K-Social 1.2

Platform sosial media fullstack dibangun dengan **SvelteKit**, menggunakan **Clean Architecture** untuk memisahkan concerns antara business logic, infrastructure, dan presentation layer.

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | SvelteKit 2 + Svelte 5 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL + Drizzle ORM |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Linting | ESLint + Prettier |
| Build Tool | Vite 8 |

---

## Arsitektur

Project ini menerapkan **Clean Architecture** dengan 4 layer utama:

```
src/
├── hooks.server.ts              ← Auth middleware + RBAC route guard
├── app.d.ts                     ← SvelteKit type augmentation (Locals.user)
│
├── lib/
│   ├── domain/                  ← Core business rules (zero dependency)
│   │   ├── entities/
│   │   │   ├── User.ts
│   │   │   └── Role.ts
│   │   ├── repositories/
│   │   │   ├── IUserRepository.ts
│   │   │   └── IRoleRepository.ts
│   │   └── value-objects/
│   │       ├── Email.ts
│   │       ├── Password.ts
│   │       ├── Username.ts
│   │       └── RoleName.ts
│   │
│   ├── application/             ← Business logic & orchestration
│   │   ├── use-cases/
│   │   │   ├── LoginUseCase.ts
│   │   │   ├── RegisterUseCase.ts
│   │   │   └── ValidateTokenUseCase.ts
│   │   ├── dtos/
│   │   │   └── auth.dto.ts
│   │   └── interfaces/
│   │       ├── IHashService.ts
│   │       └── ITokenService.ts
│   │
│   ├── infrastructure/          ← Detail teknis & third-party
│   │   ├── config/
│   │   │   ├── env.ts           ← Validated environment variables
│   │   │   ├── constants.ts     ← Shared constants (salt rounds, TTL, dll)
│   │   │   └── container.ts     ← Dependency injection wiring
│   │   ├── database/
│   │   │   ├── client.ts        ← Drizzle singleton client
│   │   │   ├── seed.ts          ← Database seeder
│   │   │   └── schema/
│   │   │       ├── index.ts
│   │   │       ├── users.ts
│   │   │       ├── roles.ts
│   │   │       └── userRoles.ts
│   │   ├── external-services/
│   │   │   ├── HashService.ts   ← bcryptjs implementation
│   │   │   └── TokenService.ts  ← jsonwebtoken implementation
│   │   └── repositories/
│   │       ├── DrizzleUserRepository.ts
│   │       └── DrizzleRoleRepository.ts
│   │
│   └── presentation/            ← Shared UI helpers
│       ├── components/
│       ├── stores/
│       └── utils/
│           ├── rbac.ts          ← hasRole, hasAnyRole, isAdmin helpers
│           ├── response.ts      ← jsonResponse, errorResponse helpers
│           └── cookie.ts        ← Auth cookie config helper
│
└── routes/
    ├── +page.svelte
    ├── +layout.svelte
    └── api/
        └── auth/
            ├── login/+server.ts
            ├── register/+server.ts
            ├── logout/+server.ts
            └── me/+server.ts
```

### Aturan Dependency

```
routes → presentation → application → domain ← infrastructure
```

- **Domain** tidak boleh import dari layer manapun
- **Application** hanya boleh import dari domain
- **Infrastructure** mengimplementasikan interface dari domain & application
- **Routes** bertindak sebagai entry point, menghubungkan semua layer

---

## Memulai Development

### Prasyarat

- Node.js >= 20
- npm >= 10
- PostgreSQL >= 15 (berjalan di port 6543)

### Instalasi

```bash
# clone repository
git clone <repo-url>
cd "k-social 1.2"

# install dependencies
npm install

# salin environment variables
cp .env.example .env
# lalu sesuaikan nilai di file .env
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:6543/ksocial2.0"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"   # format: 7d | 24h | 3600s

# Seeder (opsional, ada default untuk development)
SEED_ADMIN_EMAIL="admin.ksocial.sveltekit@admin.co.id"
SEED_ADMIN_USERNAME="admin"
SEED_ADMIN_PASSWORD="admin.ksocial.sveltekit"
```

### Setup Database

```bash
# 1. Pastikan PostgreSQL berjalan, lalu buat database
#    psql -U postgres -c 'CREATE DATABASE "ksocial2.0";'

# 2. Push schema ke database
npm run db:push

# 3. Jalankan seeder (roles + admin user)
npm run db:seed
```

### Menjalankan Dev Server

```bash
npm run dev

# atau buka browser otomatis
npm run dev -- --open
```

### Build Production

```bash
npm run build

# preview hasil build
npm run preview
```

---

## Scripts

| Script | Deskripsi |
|---|---|
| `npm run dev` | Jalankan development server |
| `npm run build` | Build untuk production |
| `npm run preview` | Preview production build |
| `npm run check` | TypeScript type checking |
| `npm run lint` | Jalankan ESLint + Prettier check |
| `npm run format` | Format semua file dengan Prettier |
| `npm run db:generate` | Generate migration files dari schema |
| `npm run db:migrate` | Jalankan pending migrations ke database |
| `npm run db:push` | Push schema langsung ke DB (development) |
| `npm run db:studio` | Buka Drizzle Studio (DB GUI di browser) |
| `npm run db:pull` | Introspect DB yang ada menjadi schema |
| `npm run db:seed` | Jalankan database seeder |

---

## Database

### Schema

Tiga tabel utama yang sudah terbentuk:

| Tabel | Deskripsi |
|---|---|
| `users` | Data user (id, email, username, password_hash) |
| `roles` | Role yang tersedia (admin, user, moderator) |
| `user_roles` | Join table many-to-many antara users dan roles |

### Workflow Schema

```bash
# Setelah mengubah file di src/lib/infrastructure/database/schema/
npm run db:generate   # generate SQL migration
npm run db:migrate    # apply ke database
npm run db:studio     # lihat data via GUI
```

### Seeder

Seeder bersifat **idempotent** — aman dijalankan berulang kali.

Yang di-seed:
- 3 roles: `admin`, `user`, `moderator`
- 1 admin user dengan credentials dari env (atau default development)

---

## Autentikasi & Otorisasi

### Auth Flow

1. Client mengirim `POST /api/auth/login` atau `POST /api/auth/register`
2. Server memvalidasi credentials, sign JWT, set `httpOnly` cookie `access_token`
3. Setiap request berikutnya — `hooks.server.ts` membaca token dari cookie atau `Authorization: Bearer` header
4. Token divalidasi, hasilnya disimpan di `event.locals.user`
5. Route yang dilindungi dicek via RBAC sebelum request diteruskan

### API Endpoints

| Method | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Registrasi user baru | — |
| `POST` | `/api/auth/login` | Login, set cookie | — |
| `POST` | `/api/auth/logout` | Hapus cookie | — |
| `GET` | `/api/auth/me` | Info user dari token | ✓ |

### RBAC

Route protection dikonfigurasi di `src/hooks.server.ts`:

```typescript
const PROTECTED_ROUTES: Array<{ pattern: RegExp; roles: RoleNameType[] }> = [
    { pattern: /^\/admin/, roles: ['admin'] }
];
```

- Unauthenticated request ke route protected → **302** redirect ke `/login` (page) atau **401** JSON (API)
- Authenticated tapi tidak punya role → **302** redirect ke `/` (page) atau **403** JSON (API)

Helper RBAC tersedia di `src/lib/presentation/utils/rbac.ts`:

```typescript
hasRole(userRoles, 'admin')
hasAnyRole(userRoles, ['admin', 'moderator'])
isAdmin(userRoles)
```

### Roles

| Role | Deskripsi |
|---|---|
| `admin` | Akses penuh ke semua fitur |
| `moderator` | Akses moderat konten |
| `user` | User biasa, role default saat register |

---

## Kontribusi

1. Buat branch baru dari `main`
2. Ikuti struktur Clean Architecture yang sudah ada
3. Pastikan `npm run check` dan `npm run lint` tidak ada error
4. Submit pull request dengan deskripsi yang jelas
