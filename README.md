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
| Linting | ESLint + Prettier |
| Build Tool | Vite 8 |

---

## Arsitektur

Project ini menerapkan **Clean Architecture** dengan 4 layer utama:

```
src/
├── lib/
│   ├── domain/                  ← Core business rules
│   │   ├── entities/            ← Business objects (User, Post, Comment)
│   │   ├── repositories/        ← Repository interfaces (kontrak)
│   │   ├── value-objects/       ← Immutable value types (Email, Username)
│   │   └── events/              ← Domain events
│   │
│   ├── application/             ← Business logic & orchestration
│   │   ├── use-cases/           ← Per-feature logic (CreateUser, Login)
│   │   ├── dtos/                ← Request/Response data shapes
│   │   ├── interfaces/          ← Port untuk external services
│   │   └── services/            ← Orchestration multi use-case
│   │
│   ├── infrastructure/          ← Detail teknis & third-party
│   │   ├── database/            ← DB client, schema, migrations
│   │   ├── repositories/        ← Implementasi konkret repository
│   │   ├── external-services/   ← Bcrypt, JWT, Mailer, dll
│   │   └── config/              ← Env vars, DI container
│   │
│   └── presentation/            ← Shared UI
│       ├── components/          ← Reusable Svelte components
│       ├── stores/              ← Global state (Svelte stores/runes)
│       └── utils/               ← UI helper functions
│
└── routes/                      ← SvelteKit pages & API endpoints
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
- PostgreSQL >= 15 (running di port 6543)

### Instalasi

```bash
# clone repository
git clone <repo-url>
cd "k-social 1.2"

# install dependencies
npm install

# salin environment variables
cp .env.example .env
# lalu isi DATABASE_URL di file .env
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
| `npm run db:push` | Push schema langsung ke DB (tanpa migration file) |
| `npm run db:studio` | Buka Drizzle Studio (DB GUI di browser) |
| `npm run db:pull` | Introspect DB yang ada menjadi schema |

---

## Database

Project ini menggunakan **PostgreSQL** dengan **Drizzle ORM**.

### Konfigurasi

Isi file `.env` dengan connection string PostgreSQL:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

Default development:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:6543/ksocial2.0"
```

### Workflow Database

```bash
# 1. Setelah menambah/mengubah schema di src/lib/infrastructure/database/schema/
npm run db:generate   # generate migration SQL

# 2. Jalankan migration ke database
npm run db:migrate

# 3. (Opsional) Lihat data via GUI
npm run db:studio
```

### Struktur Database Files

```
src/lib/infrastructure/database/
├── client.ts          ← Drizzle client (singleton)
├── schema/
│   ├── index.ts       ← Barrel export semua schema
│   ├── users.ts       ← (tambahkan schema baru di sini)
│   └── ...
└── migrations/        ← Auto-generated oleh drizzle-kit
```

---

## Struktur Routes (SvelteKit)

SvelteKit menggunakan file-based routing di `src/routes/`:

- `+page.svelte` — halaman UI
- `+page.server.ts` — server-side load function
- `+layout.svelte` — layout wrapper
- `+server.ts` — API endpoint (REST)

Contoh API endpoint: `src/routes/api/users/+server.ts` → `GET /api/users`

---
