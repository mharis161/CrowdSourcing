# Task: Wire the CrowdForge Flutter App to the Real Backend

## Where this picks up

The Flutter participant app's **UI/UX is already built** (screens, navigation,
theming) against a mock data layer (fake repositories returning fake tasks/
users). Do not redesign or rebuild screens. Your job now is:

1. Add the missing backend APIs this app needs (they don't exist yet).
2. Replace the app's mock repositories with real ones that call those APIs.
3. Replace the placeholder "perform task" screen with a real SurveyJS-based
   renderer, bundled locally (details below — this is a hard requirement,
   not optional).

If the existing mock repository interfaces don't cleanly fit the real API
shapes described below, adjust the interface — but keep changes to screens/
widgets minimal; they should mostly just be swapping which repository
implementation is injected.

## Part 1 — Backend additions (`backend/`)

Express 5 (ESM) + Prisma 7 + PostgreSQL, `backend/server.js` entry point. The
backend currently only has **company-side** task endpoints
(`backend/routes/taskRoute.js`, guarded by `companyOnly` middleware in
`backend/middleware/authMiddleware.js`) plus working auth
(`POST /api/auth/register`, `POST /api/auth/login` — no changes needed
there, they already work for the `PARTICIPANT` role). There is **no
participant-facing API at all** yet. Follow existing conventions in
`backend/controllers/taskController.js` / `authController.js` (try/catch,
`console.error`, `res.status(500).json({ message })`, Prisma `include`
patterns, default-export `prisma` from `backend/lib/prisma.js`).

1. **Schema**: add `responseData Json?` to `TaskAssignment` in
   `prisma/schema.prisma` (stores the raw submitted survey answers — see
   "why JSON not TaskQuestion rows" below). Apply with
   `npx prisma generate && npx prisma db push --accept-data-loss`
   (see `backend/scripts/run_prisma.js` — this project uses `db push`, not
   `migrate`).

2. **Auth guard**: add to `backend/middleware/authMiddleware.js`:
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
   **separate base path** `/api/participant-tasks` (not `/api/tasks` —
   avoids Express route-ordering collisions with the existing company
   routes):
   ```
   GET  /available
   POST /:id/accept
   GET  /my-assignments
   GET  /assignments/:id
   POST /assignments/:id/submit
   ```
   All guarded by `protect, participantOnly`. Register in `backend/server.js`
   next to the existing `app.use('/api/tasks', taskRoutes)`.

**Why JSON not `TaskQuestion`/`TaskResponse` rows**: companies build surveys
visually and the entire survey is saved as a **SurveyJS JSON blob** in
`Task.surveyConfig` (see `frontend/src/components/SurveyBuilder.jsx`). The
`TaskQuestion`/`TaskResponse` tables in the schema are never populated by
that flow — they're dead tables from an earlier design. Don't try to make
participant answers fit them; `TaskAssignment.responseData` (the field you're
adding) mirrors the same JSON-blob pattern already used for the survey
definition itself.

Auth note: JWT payload only contains `{ id }` (no role). Login/register
response body is a **flat** object: `{ ...userFieldsMinusPassword, token }`
— not `{ user, token }`.

## Part 2 — Wire up the Flutter app's data layer

- Replace the mock repository implementations with real ones using whatever
  HTTP client the app already has set up (check `pubspec.yaml` — likely
  `dio`). Attach `Authorization: Bearer <token>` from wherever the app
  currently stores the session (check the existing auth flow — it should
  already be persisting a token from login/register, since that screen
  already exists and presumably calls `POST /api/auth/login` /
  `POST /api/auth/register`).
- API base URL: backend runs on port 5000 locally; for an Android emulator
  use `10.0.2.2`, for a physical device use the host machine's LAN IP or the
  deployed server address if one exists — make this configurable, don't
  hardcode `localhost`.
- Map the real response shapes above onto whatever models the mock layer
  already defined; adjust model fields if the mock guessed wrong rather than
  contorting the API.

## Part 3 — Real "Perform Task" screen: local SurveyJS in a WebView

The design-phase placeholder was a generic mock-question-list renderer. This
now needs to actually render the company's real `surveyConfig` (arbitrary
SurveyJS JSON, built via the web app's survey builder), fully offline —
**no CDN**, bundled locally so version upgrades are a deliberate, manual
asset swap instead of something that silently changes behind a link.

- **Do not use `survey-react-ui`** — that requires React/ReactDOM and is
  only relevant to the web app's React tree.
- Copy exactly these two files from `frontend/node_modules/survey-core`
  (version `2.5.17`, the same version companies use to build surveys) into
  `assets/survey/` in the Flutter project: **`survey.core.min.js`** and
  **`survey-core.min.css`**. This package alone ships SurveyJS's
  framework-independent default HTML renderer (its own
  "HTML/CSS/JavaScript" get-started path — see
  `frontend/node_modules/survey-core/README.md`) — no separate UI package
  and no React runtime needed inside the WebView.
- A custom SurveyJS question type called `"gpslocation"` is registered on
  the web side via `ComponentCollection.Instance.add({...})` in
  `frontend/src/components/SurveyBuilder.jsx` (lines ~13-34) — a
  `multipletext` question with two readonly fields, `latitude`/`longitude`,
  meant to be filled programmatically rather than typed. Port that exact
  `elementsJSON` block into a small local script (`assets/survey/gps_component.js`),
  loaded after `survey.core.min.js` and before you construct
  `new Survey.Model(...)`, so a survey built on web renders identically on
  mobile.
- Build `assets/survey/survey.html`: loads `survey.core.min.js` +
  `survey-core.min.css` + `gps_component.js` locally, then JS receives the
  task's `surveyConfig` (injected by Flutter) and constructs
  `new Survey.Model(surveyConfig)`, rendering via the vanilla API — check
  `frontend/node_modules/survey-core`'s typings
  (`typings/entries/index.d.ts`) for the exact render method name, don't
  guess it.
- Use `webview_flutter` with two JS channels:
  - **`FlutterGPS`** — when the gpslocation question needs a value, JS
    notifies Flutter → Flutter gets a `geolocator` position → runs JS back
    into the page to call `survey.setValue(questionName, {latitude, longitude})`.
  - **`FlutterSubmit`** — on `survey.onComplete`, JS posts the final
    `survey.data` object through this channel → Flutter calls
    `POST /api/participant-tasks/assignments/:id/submit` with
    `{ responseData: <that data> }`.
- Future SurveyJS version upgrades: bump the version in
  `frontend/package.json`, re-copy the two `.min.js`/`.min.css` files into
  `assets/survey/`, re-test. Never point the WebView at a CDN URL for these.

## Verification
- Backend: register a `PARTICIPANT` test user, walk
  `available → accept → my-assignments → assignments/:id → submit` via
  curl/Postman, confirm `TaskAssignment.responseData`/`status` update
  correctly in Postgres.
- Flutter: run the app, log in with a real participant account, browse
  available tasks (real data, not mock), accept one, perform a survey that
  includes a gpslocation question (confirm GPS actually gets captured and
  shows up in the submitted `responseData`), submit, and confirm the
  assignment shows `SUBMITTED` in the database with the real answers.
