# Lesson Invites — Monorepo (Backend / Web Frontend / Mobile)

This repository contains a small **Lesson Invites** system split into three parts:

* `lesson-invites-backend/` — NestJS + Prisma API (built first)
* `lesson-invites-frontend/` — Next.js (App Router) + TypeScript + Tailwind admin/student UI
* `lesson-invites-mobile/` — Flutter mobile app for students (view pending invites, accept/reject)

This README explains, step-by-step, how to build, run and test each part (terminal commands included), plus file organization, common troubleshooting, and API references.

---

## Table of contents

1. Project layout
2. Prerequisites
3. Backend (NestJS + Prisma) — Setup & Run
4. Web Frontend (Next.js + TypeScript + Tailwind) — Setup & Run
5. Mobile (Flutter) — Setup & Run
6. API endpoints & sample requests (curl / Postman)
7. Git: add both folders to repo & push
8. Troubleshooting / common fixes
9. Notes, business rules & assumptions

---

## 1 — Project layout (expected at repo root)

```
Lesson-Invites-Project/
├─ lesson-invites-backend/
│  ├─ src/
│  ├─ prisma/
│  ├─ package.json
│  ├─ tsconfig.json
│  └─ .env
├─ lesson-invites-frontend/
│  ├─ app/
│  ├─ lib/
│  ├─ package.json
│  ├─ tsconfig.json
│  └─ .env.local
├─ lesson-invites-mobile/
│  ├─ lib/
│  ├─ pubspec.yaml
│  └─ android/ ios/
└─ README.md  (this file)
```

---

## 2 — Prerequisites

* Node.js `>= 18.18` (Prisma requires ≥18.18) — verify with:

  ```bash
  node -v
  npm -v
  ```
* npm or yarn
* Git
* Flutter SDK (for mobile)
* Android Studio / iOS Xcode for emulators (or a real device)

---

## 3 — Backend (NestJS + Prisma + SQLite) — Setup & Run

> Location: `lesson-invites-backend/`

### 3.1 Install dependencies

```bash
cd lesson-invites-backend
npm install
```

### 3.2 `.env` (use SQLite for fast dev)

Create `lesson-invites-backend/.env`:

```env
DATABASE_URL="file:./dev.db"
```

### 3.3 Prisma generate & migrate

```bash
# generate client
npx prisma generate

# create DB + apply migrations (creates dev.db)
npx prisma migrate dev --name init
```

If you prefer to push schema without migrations:

```bash
npx prisma db push
npx prisma generate
```

### 3.4 Start dev server

```bash
npm run start:dev
```

Default: `http://localhost:3000` (change port in `.env` or `src/main.ts` if needed).

### 3.6 Important backend notes

* CORS: `src/main.ts` should enable CORS for your frontend origin during development, e.g.:

  ```ts
  app.enableCors({ origin: 'http://localhost:3001' }); // or origin: true for dev
  ```
* If you want mobile devices to reach the backend, bind Nest to `0.0.0.0`:

  ```ts
  await app.listen(port, '0.0.0.0');
  ```
* `log.txt` is used by the backend to record actions (send/accept/reject).


## 4 — Web Frontend (Next.js + TypeScript + Tailwind) — Setup & Run

> Frontend lives in `lesson-invites-frontend/`

### 4.1 Install

```bash
cd lesson-invites-frontend
npm install
```

### 4.2 Environment

Create `lesson-invites-frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

If backend is on another host, update this value.

### 4.3 Run dev server

We recommend running Next on port `3001` to avoid conflict:

```bash
npm run dev
```

Open:

* Admin UI: `http://localhost:3001/admin`
* Student demo: `http://localhost:3001/student/1`

### 4.4 Tailwind

If you need to (re)install Tailwind:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Ensure `app/globals.css` has the `@tailwind` directives.

### 4.5 Next.js notes

* Server components can receive `params` as a Promise — `await params` in server pages.
* Client components use `'use client'`.
* `lib/api.ts` consumes `NEXT_PUBLIC_API_URL` to call backend routes.

---

## 5 — Mobile (Flutter) — Setup & Run

> Location: `lesson-invites-mobile/`

### 5.1 Create / get code

If project exists, open it. To create:

```bash
flutter create lesson_invites_mobile
cd lesson_invites_mobile
flutter pub add http intl
```

### 5.2 API base (IMPORTANT)

Open `lib/services/api_service.dart` and set `apiBase` depending on run target:

* Android emulator (AVD): `http://10.0.2.2:3000`
* Genymotion: `http://10.0.3.2:3000`
* iOS Simulator: `http://localhost:3000`
* Physical device: `http://<YOUR_PC_IP>:3000` (ensure Nest binds to `0.0.0.0`)
* Web: `http://localhost:3000` (requires CORS enabled on backend)

Example (Android emulator):

```dart
static const String apiBase = 'http://10.0.2.2:3000';
```

### 5.3 Android permission

Check `android/app/src/main/AndroidManifest.xml` includes:

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

### 5.4 Run app

```bash
flutter pub get
# start an emulator or connect device, then:
flutter run
choose chrome web
```

---

## 6 — API endpoints & sample requests

### Main endpoints

* `POST /teachers` — create teacher
* `GET /teachers` — list teachers
* `POST /students` — create student
* `GET /students` — list students
* `POST /invites/create` — create invite

  ```json
  { "teacherId": 1, "studentId": 1, "scheduledAt": "2025-09-01T10:00:00Z" }
  ```
* `POST /invites/respond/:id` — accept/reject invite

  ```json
  { "status": "accepted" } // or "rejected"
  ```
* `GET /invites` — list invites (`?status=pending|accepted|rejected`)
* `GET /invites/student/:id` — invites for a student (`?status=pending`)

### curl examples

Create teacher:

```bash
curl -X POST http://localhost:3000/teachers -H "Content-Type: application/json" \
  -d '{"name":"Mr Smith","email":"smith@example.com"}'
```

Create invite:

```bash
curl -X POST http://localhost:3000/invites/create -H "Content-Type: application/json" \
  -d '{"teacherId":1,"studentId":1,"scheduledAt":"2025-09-01T10:00:00Z"}'
```

Respond (accept):

```bash
curl -X POST http://localhost:3000/invites/respond/1 -H "Content-Type: application/json" \
  -d '{"status":"accepted"}'
```

---

## 7 — Git: add both folders to one repo & push

If both folders are already inside the repo root:

```bash
cd /path/to/your/repo-root
# create .gitignore if not present
cat > .gitignore <<'EOF'
# node
**/node_modules/
**/dist/
.env
*.sqlite
dev.db
log.txt

# flutter
/.dart_tool/
/.packages
/.build/
.flutter-plugins
.flutter-plugins-dependencies
.idea/
.vscode/
EOF

# stage changes
git add .
git commit -m "Add backend, frontend and mobile apps"

# set main branch and push (first time)
git branch -M main
git push --set-upstream origin main
```

If `git push` is rejected because remote has commits, either:

* Merge remote:

  ```bash
  git pull origin main --allow-unrelated-histories
  git push origin main
  ```
* Or overwrite remote (use with caution):

  ```bash
  git push --force origin main
  ```

---

## 8 — Troubleshooting / common fixes

### Backend

* `Prisma preinstall` error (Node version): ensure `node -v` ≥ `18.18`.
* `npx prisma migrate dev` errors: check `DATABASE_URL`, DB availability.
* Bind to `0.0.0.0` if physical devices must access the API.

### Frontend (Next.js)

* `params.id` error: server page must `await params` or use server→client split.
* CORS errors: enable CORS in Nest: `app.enableCors({ origin: 'http://localhost:3001' })` or `origin: true` in dev.

### Mobile (Flutter)

* `ClientException: Failed to fetch`: emulator host mismatch. Use:

  * Android emulator: `10.0.2.2`
  * iOS simulator: `localhost`
  * Physical device: use host LAN IP and bind backend to `0.0.0.0`
* `Cannot send Null`: ensure `apiBase` is not null and `Uri.tryParse()` succeeds.
* Check `AndroidManifest.xml` has Internet permission.

---

## 9 — Notes, business rules & assumptions

Implemented business rules (backend):

* Invite statuses: `pending`, `accepted`, `rejected`.
* Only one accepted invite per student per scheduled time.
* When a student accepts an invite, all other invites for the same student & same `scheduledAt` are automatically rejected.
* Teacher cannot send duplicate invite for the same student/time (DB unique constraint).
* All actions (send/accept/reject) are appended to `log.txt`.

Assumptions:

* Date/time exchanged as ISO strings. Frontend converts `datetime-local` to ISO before POST.
* No authentication is implemented (student id is supplied for demo/testing).
* SQLite is used for quick local development.

---

## Useful commands summary

### Backend

```bash
cd lesson-invites-backend
npm install
# set .env DATABASE_URL="file:./dev.db"
npx prisma generate
npx prisma migrate dev --name init
npm run start:dev
npx prisma studio
```

### Frontend (Next.js)

```bash
cd lesson-invites-frontend
npm install
# set .env.local NEXT_PUBLIC_API_URL=http://localhost:3000
npm run dev
```

### Mobile (Flutter)

```bash
cd lesson-invites-mobile
flutter pub get
# set API_BASE in lib/services/api_service.dart to the correct host:
# Android emulator -> http://10.0.2.2:3000
flutter run







