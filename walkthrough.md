# Walkthrough - Step 2: Perbaiki Penanganan Error, Lengkapi Use Case yang Hilang, dan Hilangkan Akses Langsung ke Repository

Tahap kedua perbaikan arsitektur Clean Architecture pada K-Social 1.2 telah selesai dieksekusi dengan hasil validasi **0 errors** pada `npm run check`.

---

## 1. Perubahan yang Dilakukan

### A. Lapisan Application: Exceptions & Response Utils
- **Decoupling Application Error dari HTTP**:
  - Di [`src/lib/application/exceptions/index.ts`](file:///c:/Users/Muhammad%20Krisna/Documents/ProjectSerius/Project%20Sveltekit%28FULLSTACK%29/ksocial2.0-main/src/lib/application/exceptions/index.ts), `ApplicationError` kini memakai properti `code: ErrorCode` (`'APPLICATION_ERROR' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'CONFLICT'`) tanpa ketergantungan konsep HTTP status code di domain/application constructor.
  - Menambahkan kelas exception `AuthorizationError` (untuk kasus unauthorized action / 403 Forbidden).
- **Pemetaan HTTP Status di Presentation**:
  - Di [`src/lib/presentation/utils/response.ts`](file:///c:/Users/Muhammad%20Krisna/Documents/ProjectSerius/Project%20Sveltekit%28FULLSTACK%29/ksocial2.0-main/src/lib/presentation/utils/response.ts), dibuat helper `getHttpStatusForError(err: unknown): number` yang memetakan error aplikasi ke status HTTP yang sesuai (400, 401, 403, 404, 409, 500).
  - `handleApplicationError` dan `handleActionError` kini menggunakan pemetaan terpusat tersebut.

### B. DTOs Baru
- [`src/lib/application/dtos/user.dto.ts`](file:///c:/Users/Muhammad%20Krisna/Documents/ProjectSerius/Project%20Sveltekit%28FULLSTACK%29/ksocial2.0-main/src/lib/application/dtos/user.dto.ts):
  - `UserProfileDTO`: Representasi data profil lengkap termasuk follower/following count, status relasi follow, dan evaluasi hak akses postingan (`canViewPosts`).
  - `UserSummaryDTO`: Representasi ringkas data user untuk sesi dan halaman pengaturan.
- [`src/lib/application/dtos/notification.dto.ts`](file:///c:/Users/Muhammad%20Krisna/Documents/ProjectSerius/Project%20Sveltekit%28FULLSTACK%29/ksocial2.0-main/src/lib/application/dtos/notification.dto.ts):
  - `NotificationDTO`: Representasi notifikasi lengkap dengan identitas pengirim (`senderUsername`, `senderName`), mencegah query terpisah di presentation layer.

### C. Use Cases Baru & Penyempurnaan Error Handling
- **Use Cases Baru**:
  - [`UnfollowUserUseCase`](file:///c:/Users/Muhammad%20Krisna/Documents/ProjectSerius/Project%20Sveltekit%28FULLSTACK%29/ksocial2.0-main/src/lib/application/use-cases/follow/UnfollowUserUseCase.ts): Mengenkapsulasi proses unfollow, mendukung pencarian target baik via `followingId` maupun `followingUsername`.
  - [`GetUserProfileUseCase`](file:///c:/Users/Muhammad%20Krisna/Documents/ProjectSerius/Project%20Sveltekit%28FULLSTACK%29/ksocial2.0-main/src/lib/application/use-cases/user/GetUserProfileUseCase.ts): Menyatukan logika profil, counter followers/following, evaluasi status relasi follow, dan perhitungan izin melihat postingan (`canViewPosts`).
  - [`GetUserByIdUseCase`](file:///c:/Users/Muhammad%20Krisna/Documents/ProjectSerius/Project%20Sveltekit%28FULLSTACK%29/ksocial2.0-main/src/lib/application/use-cases/user/GetUserByIdUseCase.ts): Mengambil data user berdasarkan ID dengan typed error.
- **Penyempurnaan Use Cases Existing**:
  - [`GetNotificationsUseCase`](file:///c:/Users/Muhammad%20Krisna/Documents/ProjectSerius/Project%20Sveltekit%28FULLSTACK%29/ksocial2.0-main/src/lib/application/use-cases/notification/GetNotificationsUseCase.ts): Menginjeksi `IUserRepository` dan mengembalikan `NotificationDTO[]` dengan pengirim yang sudah dimuat secara efisien (mengeliminasi masalah N+1 query loop di layout).
  - [`FollowUserUseCase`](file:///c:/Users/Muhammad%20Krisna/Documents/ProjectSerius/Project%20Sveltekit%28FULLSTACK%29/ksocial2.0-main/src/lib/application/use-cases/follow/FollowUserUseCase.ts): Mendukung `followingUsername` secara langsung.
  - [`SendMessageUseCase`](file:///c:/Users/Muhammad%20Krisna/Documents/ProjectSerius/Project%20Sveltekit%28FULLSTACK%29/ksocial2.0-main/src/lib/application/use-cases/chat/SendMessageUseCase.ts): Mengganti generic `Error` dengan `ValidationError`, `NotFoundError`, dan `AuthorizationError`.
  - [`GetMessagesUseCase`](file:///c:/Users/Muhammad%20Krisna/Documents/ProjectSerius/Project%20Sveltekit%28FULLSTACK%29/ksocial2.0-main/src/lib/application/use-cases/chat/GetMessagesUseCase.ts): Melempar `ValidationError`.
  - [`AcceptFollowUseCase`](file:///c:/Users/Muhammad%20Krisna/Documents/ProjectSerius/Project%20Sveltekit%28FULLSTACK%29/ksocial2.0-main/src/lib/application/use-cases/follow/AcceptFollowUseCase.ts): Melempar `NotFoundError`.
  - [`DeletePostUseCase`](file:///c:/Users/Muhammad%20Krisna/Documents/ProjectSerius/Project%20Sveltekit%28FULLSTACK%29/ksocial2.0-main/src/lib/application/use-cases/post/DeletePostUseCase.ts): Melempar `ValidationError` & `NotFoundError`.
  - [`DeleteCommentUseCase`](file:///c:/Users/Muhammad%20Krisna/Documents/ProjectSerius/Project%20Sveltekit%28FULLSTACK%29/ksocial2.0-main/src/lib/application/use-cases/post/DeleteCommentUseCase.ts): Melempar `ValidationError`, `NotFoundError`, `AuthorizationError`, serta memanggil `postRepository.decrementComments`.

### D. Eliminasi Akses Langsung Repository di Presentation Layer
Seluruh 5 file server routes yang sebelumnya membypass use case telah diperbaiki:
1. [`src/routes/user/[username]/+page.server.ts`](file:///c:/Users/Muhammad%20Krisna/Documents/ProjectSerius/Project%20Sveltekit%28FULLSTACK%29/ksocial2.0-main/src/routes/user/%5Busername%5D/+page.server.ts): Menggunakan `getUserProfileUseCase`, `followUserUseCase`, dan `unfollowUserUseCase`.
2. [`src/routes/user/profile/[username]/+page.server.ts`](file:///c:/Users/Muhammad%20Krisna/Documents/ProjectSerius/Project%20Sveltekit%28FULLSTACK%29/ksocial2.0-main/src/routes/user/profile/%5Busername%5D/+page.server.ts): Menggunakan `getUserProfileUseCase` dan `followUserUseCase`.
3. [`src/routes/user/profile/+page.server.ts`](file:///c:/Users/Muhammad%20Krisna/Documents/ProjectSerius/Project%20Sveltekit%28FULLSTACK%29/ksocial2.0-main/src/routes/user/profile/+page.server.ts): Menggunakan `getUserProfileUseCase` dan `getUserByIdUseCase`.
4. [`src/routes/user/settings/+page.server.ts`](file:///c:/Users/Muhammad%20Krisna/Documents/ProjectSerius/Project%20Sveltekit%28FULLSTACK%29/ksocial2.0-main/src/routes/user/settings/+page.server.ts): Menggunakan `getUserByIdUseCase`.
5. [`src/routes/user/+layout.server.ts`](file:///c:/Users/Muhammad%20Krisna/Documents/ProjectSerius/Project%20Sveltekit%28FULLSTACK%29/ksocial2.0-main/src/routes/user/+layout.server.ts): Menggunakan `getUserByIdUseCase` dan `getNotificationsUseCase` (menghapus N+1 loop).
6. [`src/routes/api/chat/[userId]/+server.ts`](file:///c:/Users/Muhammad%20Krisna/Documents/ProjectSerius/Project%20Sveltekit%28FULLSTACK%29/ksocial2.0-main/src/routes/api/chat/%5BuserId%5D/+server.ts): Mengganti pengecekan manual string error `message.includes('follow')` dengan `handleApplicationError`.

### E. Penegakan Batasan Arsitektur pada DI Container
- Di [`src/lib/infrastructure/config/container.ts`](file:///c:/Users/Muhammad%20Krisna/Documents/ProjectSerius/Project%20Sveltekit%28FULLSTACK%29/ksocial2.0-main/src/lib/infrastructure/config/container.ts):
  - Seluruh repository getters (`userRepository`, `roleRepository`, `postRepository`, `followRepository`, `notificationRepository`, `likeRepository`, `commentRepository`, `messageRepository`) dan service getters internal (`hashService`, `tokenService`) dijadikan **`private`**.
  - Presentation layer tidak lagi memiliki akses langsung ke repository pada waktu kompilasi maupun runtime.
  - Inisialisasi event handler dipindahkan secara rapi ke constructor `Container`.

---

## 2. Hasil Verifikasi

Jalankan pemeriksaan type-safety TypeScript dan SvelteKit:
```bash
npm run check
```

**Hasil:**
```
svelte-check found 0 errors and 33 warnings in 11 files
```
*(33 warnings adalah a11y & runes warning bawaan dari komponen Svelte template).*
Semua route, use case, DTO, dan type boundary lulus tanpa ada satu pun error.
Semua akses repository dari `src/routes/**` berhasil dieliminasi 100%.

---

# Walkthrough - Step 3: Pembersihan File Backend yang Tidak Terpakai (Dead Code Cleanup)

Pembersihan file backend (*dead code* dan *scratch scripts*) pada K-Social telah selesai dieksekusi dengan hasil validasi **0 errors** pada `npm run check`.

## 1. File yang Dihapus & Disesuaikan

### A. Application Layer & DI Container
- **Dihapus**:
  - `src/lib/application/use-cases/user/DeleteAccountUseCase.ts`: Use case ini tidak pernah dipanggil di endpoint, halaman, maupun action mana pun.
- **Diperbarui**:
  - [`src/lib/infrastructure/config/container.ts`](file:///c:/Users/Muhammad%20Krisna/Documents/ProjectSerius/Project%20Sveltekit%28FULLSTACK%29/ksocial2.0-main/src/lib/infrastructure/config/container.ts): Menghapus import `DeleteAccountUseCase` dan getter `deleteAccountUseCase`.

### B. Legacy Route API Layer
Autentikasi pada K-Social saat ini telah sepenuhnya berpindah ke SvelteKit Form Actions yang idiomatik (`src/routes/(auth)/login/+page.server.ts` dan `src/routes/(auth)/register/+page.server.ts`), sehingga seluruh REST API auth yang tidak pernah dipanggil oleh client dihapus:
- **Dihapus**:
  - `src/routes/api/auth/login/+server.ts`
  - `src/routes/api/auth/register/+server.ts`
  - `src/routes/api/auth/logout/+server.ts`
  - `src/routes/api/auth/me/+server.ts`
  - Direktori `src/routes/api/auth/` (kini bersih/dihapus).

### C. Scratch / Debug Test Scripts di Root
File-file uji coba koneksi database Postgres/Drizzle ad-hoc yang tertinggal di root directory telah dibersihkan:
- **Dihapus**:
  - `test_db.ts`
  - `check_db.ts`
  - `test_pg.js`

## 2. Hasil Verifikasi

Jalankan pemeriksaan type-safety TypeScript dan SvelteKit:
```bash
npm run check
```

**Hasil:**
```
svelte-check found 0 errors and 33 warnings in 10 files
```
*(33 warnings adalah a11y & runes warning bawaan dari komponen Svelte template).*
Semua rute, use cases, entities, repositories, dan database schemas tetap utuh dan valid tanpa error kompilasi.

