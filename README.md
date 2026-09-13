# K-Social 1.2

Platform sosial media fullstack dibangun dengan **SvelteKit**, menggunakan **Clean Architecture** untuk memisahkan concerns antara business logic, infrastructure, dan presentation layer.

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | SvelteKit 2 + Svelte 5 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
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

### Instalasi

```bash
# clone repository
git clone <repo-url>
cd "k-social 1.2"

# install dependencies
npm install
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

---

## Struktur Routes (SvelteKit)

SvelteKit menggunakan file-based routing di `src/routes/`:

- `+page.svelte` — halaman UI
- `+page.server.ts` — server-side load function
- `+layout.svelte` — layout wrapper
- `+server.ts` — API endpoint (REST)

Contoh API endpoint: `src/routes/api/users/+server.ts` → `GET /api/users`

---
