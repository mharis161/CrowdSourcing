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

1. **Schema**:
   - Add `responseData Json?` to `TaskAssignment` in `prisma/schema.prisma`
     (stores the raw submitted survey answers — see "why JSON not
     TaskQuestion rows" below).
   - Add a **parent location** to `User`: `homeLatitude Float?` and
     `homeLongitude Float?`. This is the participant's fixed base location
     (set once from their profile, not their live/current GPS — current
     device location is deliberately *not* trusted for task matching since
     it can be anything at request time). Only meaningful for
     `PARTICIPANT` users, but a plain nullable field on `User` is simplest;
     don't split into a separate model for this.
   - Apply with `npx prisma generate && npx prisma db push --accept-data-loss`
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
   - `updateHomeLocation` (`PATCH /profile/location`, body `{ latitude, longitude }`) — sets `req.user`'s `homeLatitude`/`homeLongitude`. Called once during onboarding and any time the participant wants to change their base location from their profile screen; not part of every request.
   - `getAvailableTasks` — **hard-filtered by the participant's stored home location, not live GPS**. Logic:
     1. If `req.user.homeLatitude`/`homeLongitude` are null, return an empty list with a message like `"Set your location in your profile to see available tasks"` — don't guess a location.
     2. Otherwise `Task.findMany({ where: { status: 'ACTIVE' }, include: { locations: true, company: { select: { companyName: true } } } })`, excluding tasks the current user already has a `TaskAssignment` for.
     3. For each task, compute the Haversine distance (in meters, to match `TaskLocation.radius`'s unit — see note below) from the participant's home location to *each* of the task's `TaskLocation` rows. Keep the task only if **at least one** of its locations has `distance <= that location's own radius` — each task location's radius is company-set per task (already exists, see `TaskLocation.radius` and `frontend/src/components/MapPicker.jsx`'s radius slider), there is no separate global radius constant.
     4. Sort surviving tasks by their nearest matching location's distance, attach `distanceKm` per task for display.
     No PostGIS in this DB — do the distance math and filtering in Node.
     5. **Start/end date window**: `Task` has nullable `startDate`/`endDate`. Tasks whose `endDate` has already passed are excluded entirely (fully closed, not shown at all). Tasks with a future `startDate` **are still included** — attach `canAccept: !task.startDate || task.startDate <= now` per task so the UI can show it with a "starts in …" countdown and a disabled Accept button until then.
   - `acceptTask` (`POST /:id/accept`) — 404 if task missing/not ACTIVE; 400 if `now < task.startDate` ("This task has not started yet") or `now > task.endDate` ("This task has already ended"); 409 if `maxParticipants` already reached; otherwise create a `TaskAssignment` (`status: IN_PROGRESS`, `reward: task.reward`); rely on the existing `@@unique([taskId, participantId])` constraint to reject double-accepts (catch and return 409). Note: `submitAssignment` deliberately does **not** re-check `endDate` — a participant who already accepted before the end date keeps a grace period to submit even after it passes.
   - `getMyAssignments` — assignments for `req.user.id`, `include: { task: { include: { locations: true } } }`, optional `?status=` filter.
   - `getAssignmentById` — ownership-checked single assignment with its task (need `task.surveyConfig` for the perform screen).
   - `submitAssignment` (`POST /assignments/:id/submit`, body `{ responseData }`) — ownership check, reject if not `IN_PROGRESS`, then set `responseData`, `status: 'SUBMITTED'`, `submittedAt: new Date()`.

   **Unit note**: `TaskLocation.radius` is stored in **meters** (the web
   app's slider in `MapPicker.jsx` goes from 100 to 5000, labeled `{radius}m`
   — company sets this per task location, it is *not* a fixed 5km/10km
   constant anywhere in code). Keep your distance calculation in meters to
   match directly; only convert to km for display (`distanceKm`).

4. **New routes** `backend/routes/participantTaskRoute.js`, mounted at a
   **separate base path** `/api/participant-tasks` (not `/api/tasks` —
   avoids Express route-ordering collisions with the existing company
   routes):
   ```
   PATCH /profile/location
   GET   /available
   POST  /:id/accept
   GET   /my-assignments
   GET   /assignments/:id
   POST  /assignments/:id/submit
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

### Parent location (new — required before "Available Tasks" works at all)

The available-tasks list is hard-filtered server-side by the participant's
stored **home location**, not live GPS (current device location is
deliberately not trusted for matching — see Part 1). So the app needs a
one-time "set your location" step, and a way to change it later:

- Add a location step to onboarding (right after registration, before the
  home screen) and a re-editable entry point from the profile screen. Offer
  **both** input methods, participant's choice:
  1. **Drop a pin on a map** — same idea as the web app's company-side
     `MapPicker.jsx` (pick a point, no radius needed here since this is the
     participant's point, not a zone).
  2. **Capture current device GPS once** — via `geolocator`, used as a
     one-time snapshot to set the field, not continuous tracking.
- On either method, call `PATCH /api/participant-tasks/profile/location`
  with `{ latitude, longitude }`.
- If the participant skips this or the profile has no location yet, the
  Available Tasks tab should show an empty state prompting them to set a
  location (matches the backend's behavior of returning an empty list until
  `homeLatitude`/`homeLongitude` are set) rather than erroring.
- Each task card should show its distance (`distanceKm`, returned by the
  API) from this stored home location.
- Each task card also carries `canAccept`, `startDate`, `endDate`. When
  `canAccept` is `false` (task's `startDate` is in the future), show a
  countdown ("Starts in 2 days") and disable the Accept action instead of
  hiding the card — the participant should be able to see what's coming.
  Once `startDate` passes the card becomes acceptable without any client
  action needed (just re-fetch or recompute against the current time).
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
- Backend: register a `PARTICIPANT` test user, set their home location via
  `PATCH /profile/location`, create a company task (via the web app) with a
  `TaskLocation` inside that radius, then walk
  `available → accept → my-assignments → assignments/:id → submit` via
  curl/Postman — confirm the task actually shows up in `available` (and
  that a task *outside* the radius correctly does not), and that
  `TaskAssignment.responseData`/`status` update correctly in Postgres.
- Flutter: run the app, log in with a real participant account, set a home
  location via the new onboarding step, browse available tasks (real data,
  not mock, correctly distance-filtered), accept one, perform a survey that
  includes a gpslocation question (confirm GPS actually gets captured and
  shows up in the submitted `responseData`), submit, and confirm the
  assignment shows `SUBMITTED` in the database with the real answers.
