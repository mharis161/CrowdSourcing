# Task: Build the CrowdForge Participant Mobile App (Flutter)

## Project context

CrowdForge is a crowdsourcing platform. The repo root has:
- `backend/` — Express 5 (ESM) + Prisma 7 + PostgreSQL. Entry point `server.js`, port 5000.
- `frontend/` — React 19 + Vite + Tailwind + Zustand + axios, the company-side web app.

You are building a **new Flutter mobile app** (put it in a new `mobile/` folder at
the repo root, sibling to `backend/` and `frontend/`) for **PARTICIPANT** users
(as opposed to COMPANY users, who use the web app). The mobile app's job:

1. Participant logs in.
2. They see tasks they can do — either tasks already assigned to them (in
   progress / submitted) or tasks nearby/available to pick up.
3. They open a task and perform it (fill out a survey).
4. They submit it.

## Data model (read `backend/prisma/schema.prisma` yourself for full detail)

Key models: `User` (role: `PARTICIPANT | COMPANY | ADMIN`), `Company`, `Task`
(has `title, description, type, reward, maxParticipants, status
(DRAFT|ACTIVE|PAUSED|COMPLETED), deadline, surveyConfig Json`),
`TaskLocation` (`latitude, longitude, radius` — a task can have one or more
geofenced locations), `TaskAssignment` (links a participant to a task, with
`status: IN_PROGRESS|SUBMITTED|APPROVED|REJECTED`, `reward`, `submittedAt`).

**Important quirk you must respect**: companies build surveys visually and the
entire survey is saved as a **SurveyJS JSON blob** in `Task.surveyConfig` (see
`frontend/src/components/SurveyBuilder.jsx`, which uses `survey-creator-react`
at version `2.5.17`, matching `frontend/package.json`). The schema also has
`TaskQuestion`/`TaskResponse` tables but **they are never populated** by the
existing web flow — don't try to use them for participant answers, they're
dead tables from an earlier design. Instead, participant answers must be
stored as a JSON blob too (see backend task below — you'll add a
`responseData Json?` field to `TaskAssignment` for this).

A custom SurveyJS question type called `"gpslocation"` is already registered
in `SurveyBuilder.jsx` via `ComponentCollection.Instance.add({...})` — it's a
`multipletext` question with two readonly fields, `latitude` and `longitude`,
meant to be filled programmatically by the mobile app (not typed by the user).
Copy that exact `elementsJSON` definition when you register the same custom
question type for rendering on mobile, so a survey built on web renders
identically on mobile.

## Part 1 — Backend additions (`backend/`)

The backend currently only has **company-side** task endpoints
(`backend/routes/taskRoute.js`, all guarded by a `companyOnly` middleware in
`backend/middleware/authMiddleware.js`). There is **no participant-facing API
at all**. You need to add one. Follow the existing code conventions exactly —
look at `backend/controllers/taskController.js` and
`backend/controllers/authController.js` for style (try/catch, `console.error`,
`res.status(500).json({ message })` on failure, Prisma `include` patterns,
default-export `prisma` from `backend/lib/prisma.js`).

1. **Schema**: add `responseData Json?` to the `TaskAssignment` model in
   `prisma/schema.prisma`. Apply with the project's existing convention:
   `npx prisma generate` then `npx prisma db push --accept-data-loss` (see
   `backend/scripts/run_prisma.js` — this project uses `db push`, not `migrate`).

2. **Auth guard**: add `participantOnly` to `backend/middleware/authMiddleware.js`,
   mirroring the existing `companyOnly`:
   ```js
   export const participantOnly = (req, res, next) => {
     if (req.user && req.user.role === 'PARTICIPANT') next();
     else res.status(403).json({ message: 'Access denied: Participants only' });
   };
   ```

3. **New controller** `backend/controllers/participantTaskController.js`:
   - `getAvailableTasks` — `Task.findMany({ where: { status: 'ACTIVE' }, include: { locations: true, company: { select: { companyName: true } } } })`, excluding tasks the current user already has a `TaskAssignment` for. If `lat`/`lng` query params are given, compute Haversine distance in JS against each task's locations, attach `distanceKm`, sort by it (no PostGIS in this DB — do it in Node).
   - `acceptTask` (`POST /:id/accept`) — 404 if task missing/not ACTIVE; 409 if `maxParticipants` already reached; otherwise create a `TaskAssignment` (`status: IN_PROGRESS`, `reward: task.reward`); rely on the existing `@@unique([taskId, participantId])` constraint to reject double-accepts (catch and return 409).
   - `getMyAssignments` — assignments for `req.user.id`, `include: { task: { include: { locations: true } } }`, optional `?status=` filter.
   - `getAssignmentById` — ownership-checked single assignment with its task (need `task.surveyConfig` for the perform screen).
   - `submitAssignment` (`POST /assignments/:id/submit`, body `{ responseData }`) — ownership check, reject if not `IN_PROGRESS`, then set `responseData`, `status: 'SUBMITTED'`, `submittedAt: new Date()`.

4. **New routes** `backend/routes/participantTaskRoute.js`, mounted at a
   **separate base path** `/api/participant-tasks` (not `/api/tasks` — avoids
   Express route-ordering collisions with the existing company routes):
   ```
   GET  /available
   POST /:id/accept
   GET  /my-assignments
   GET  /assignments/:id
   POST /assignments/:id/submit
   ```
   All guarded by `protect, participantOnly`. Register in `backend/server.js`
   next to the existing `app.use('/api/tasks', taskRoutes)`.

Auth notes: `POST /api/auth/login` and `/register` already exist and work for
any role including `PARTICIPANT` — no changes needed there. The JWT payload
only contains `{ id }` (no role), and the login/register response body is a
**flat** object: `{ ...userFieldsMinusPassword, token }` — not
`{ user, token }`. Parse accordingly.

## Part 2 — Flutter app (`mobile/`)

- `flutter create mobile`, Android first.
- Packages: `dio` (HTTP + interceptor attaching `Authorization: Bearer <token>`,
  mirroring `frontend/src/api/axios.js`), `flutter_secure_storage` (JWT token),
  `riverpod` (state management), `geolocator` + `permission_handler` (GPS),
  `webview_flutter` (survey rendering).
- API base URL: backend runs on port 5000; for an Android emulator use
  `10.0.2.2`, for a physical device use the host machine's LAN IP — make this
  configurable, don't hardcode `localhost`.

### Screens
1. **Login** — email/password → `POST /api/auth/login`. Client-side reject if
   `role !== 'PARTICIPANT'` (this app is participant-only).
2. **Home**, two tabs:
   - *Available* — `GET /api/participant-tasks/available?lat=&lng=` (current
     GPS position via `geolocator`), sorted by distance, pull-to-refresh.
   - *My Tasks* — `GET /api/participant-tasks/my-assignments`, status chips
     (In Progress / Submitted / Approved / Rejected).
3. **Task Detail** — title/description/reward/deadline/distance. "Start Task"
   (`POST /:id/accept`) if not yet accepted, else "Continue"/"View" depending
   on assignment status.
4. **Perform Task (WebView)** — bundle a local HTML asset
   (`assets/survey/survey.html`) with the SurveyJS runtime at version
   `2.5.17` (match `frontend/package.json`) plus the `gpslocation` custom
   question registration ported from `SurveyBuilder.jsx`. Bridge:
   - Inject the task's `surveyConfig` JSON and build the `Survey` model in JS.
   - JS channel `FlutterGPS`: when the gpslocation question needs a value,
     JS notifies Flutter → Flutter gets a `geolocator` position → runs JS back
     into the page to call `survey.setValue(questionName, {latitude, longitude})`.
   - On `survey.onComplete`, JS posts the final `survey.data` object through
     JS channel `FlutterSubmit` → Flutter calls
     `POST /api/participant-tasks/assignments/:id/submit` with `{ responseData: <that data> }`.
   - Confirm the exact standalone (non-React) SurveyJS embed API against the
     installed `survey-core@2.5.17` docs/package contents — don't guess it,
     check `frontend/node_modules/survey-core` for the actual export surface.
5. **Submission success** screen → back to My Tasks (status now `SUBMITTED`).

### Suggested structure
```
mobile/lib/
  core/{api_client.dart, secure_storage.dart}
  models/{user.dart, task.dart, assignment.dart}
  providers/{auth_provider.dart, task_provider.dart, location_provider.dart}
  screens/{login_screen.dart, home_screen.dart, task_detail_screen.dart, task_perform_screen.dart}
mobile/assets/survey/{survey.html, gps_component.js}
```

## Acceptance criteria / how to verify
- Backend: register a `PARTICIPANT` test user, then walk
  `available → accept → my-assignments → assignments/:id → submit` via
  curl/Postman, confirm `TaskAssignment.responseData` and `status` update
  correctly in Postgres.
- Flutter: `flutter run` on an emulator/device, complete the full flow —
  login → browse nearby → accept → perform a survey that includes a
  gpslocation question → submit — and confirm the assignment shows
  `SUBMITTED` with the answers in the database.

## Known environment caveat (fix before running on Android)
The dev machine had an old Flutter (3.13.1/Dart 3.1.0) and an incomplete
Android toolchain (`cmdline-tools` missing, licenses not accepted, no
emulator/device attached). Run `flutter doctor` first and resolve any
blockers before attempting `flutter run`.
