# Task: Design the CrowdForge Participant Mobile App UI/UX (Flutter, iOS + Android)

## Where you're starting from

A basic Flutter project already exists (I'll point you at its folder). Work
inside that existing project — do **not** run `flutter create` again or
discard what's there. If it's genuinely just the default counter-app
boilerplate, you can replace the contents of `lib/`, but keep the existing
`pubspec.yaml`/project name/package identifiers unless they're placeholders.

## What this app is

CrowdForge is a crowdsourcing task platform. There's already a web app where
**companies** post paid tasks (surveys, data entry, review work). This Flutter
app is the **participant-side mobile client** — the people who actually do
the tasks and get paid. Core loop:

1. Participant registers/logs in.
2. They see a dashboard: their assigned/in-progress tasks, tasks they can
   pick up, and how much they've earned.
3. They open a task, see its details (what to do, how much it pays).
4. They perform the task (fill out a survey) and submit it.
5. The task moves to "submitted", and once approved, the reward amount
   counts toward their earnings.

This request is **design/UI phase only** — screens, navigation, visual
design, and component structure. Do **not** wire up a real backend yet: build
against a mock/fake data layer (see "Architecture" below) so the UI is fully
browsable and demoable on its own. Structure the code so swapping the fake
data source for a real API later is a small, contained change, not a rewrite.

## Brand / visual identity (match the existing web app — don't invent a new one)

The web app's design language:
- **Primary color**: `#7f0df2` (purple) — used for primary buttons, active
  nav states, accents, focus rings.
- Clean, modern SaaS look: white cards on a very light slate background
  (`#f8fafc`), rounded-2xl corners, soft shadows, bold black headings,
  slate-gray secondary text, generous padding.
- Status colors follow convention: emerald/green for success/approved/active,
  amber/orange for pending/in-progress, red for rejected/errors.
- The web app's participant dashboard (currently a static mockup) shows:
  stat cards (Total Earned, Tasks Completed, Active Hours, Success Rate),
  a task list with reward amount prominently displayed per card, tags,
  time estimate, difficulty. Use this as inspiration for information
  density and hierarchy, adapted to mobile patterns (not a literal port of
  a desktop sidebar layout).
- Use Flutter Material 3 with a custom `ColorScheme` seeded from `#7f0df2`.
  Keep it visually consistent between iOS and Android (this is a branded
  product, not a "feels native to each OS" utility app) — but still use
  adaptive platform conventions where it matters for usability (back
  gestures, safe areas, platform-appropriate haptics/dialogs).

## Screens to design

1. **Splash / bootstrap** — brief branded loading screen while checking for
   a stored session (mock: just a fixed delay for now).
2. **Login** — email + password.
3. **Register** — name, email, password (role is implicitly PARTICIPANT in
   this app — no role picker needed, unlike the web app which serves both
   companies and participants).
4. **Home / Dashboard** — earnings summary (total earned, tasks completed,
   pending amount), and two lists/tabs:
   - **Available tasks** — tasks the participant can pick up. Each card:
     title, category/type, reward amount (prominent), short description or
     tags, estimated distance (mock GPS-style "2.3 km away" — see note
     below), deadline.
   - **My tasks** — tasks already accepted, grouped/filterable by status:
     In Progress, Submitted, Approved, Rejected. Approved ones show the
     reward as "earned"; Rejected ones show a reason if available.
5. **Task Detail** — full description, reward, deadline, location
   (map preview is fine as a static/placeholder widget for now), and a
   primary CTA button that changes by state: "Accept Task" (available) →
   "Continue Task" (in progress) → "View Submission" (submitted/approved/
   rejected).
6. **Task Perform** — the screen where the participant actually does the
   work. For this design pass, build it as a **generic dynamic form
   renderer** driven by a simple mock question list (question text, type:
   short text / multiple choice / rating / yes-no / GPS-capture
   placeholder), with a submit button at the end. Don't worry about it being
   pixel-perfect to any particular survey engine — the real integration
   later will likely swap this screen's internals for a WebView-based
   renderer, so keep this screen's *data contract* simple and swappable
   (a list of question objects in, an answers map out) rather than hard-
   coding survey-specific logic into the UI shell around it.
7. **Submission success** — confirmation screen, reward amount earned,
   button back to dashboard.
8. **Profile / Earnings** — participant info, total earnings breakdown,
   logout.

## Architecture expectations

- Use a clean separation: `models/` (plain Dart classes: `User`, `Task`,
  `TaskAssignment`), `data/` (a repository interface + one `MockTaskRepository`
  / `MockAuthRepository` implementation returning fake data with realistic
  delays), `providers/` or `state/` (Riverpod recommended — or whatever this
  project's `pubspec.yaml` already has set up, don't introduce a second
  state-management library if one's already there), `screens/`, `widgets/`
  (reusable pieces: task card, stat card, status badge/chip, etc.).
- Every screen should read from the repository interface, never from mock
  data directly, so swapping in a real HTTP-backed repository later doesn't
  touch screen code.
- Reward/currency formatting, date formatting, and status→color/label
  mapping should be centralized helpers, not repeated inline per screen.

## What to verify before calling this done

- Run the app on both an Android emulator/device and iOS simulator (if on
  macOS; otherwise at least verify no iOS-specific API misuse) and walk the
  full flow: splash → login → dashboard → browse available → task detail →
  accept → perform → submit → back to dashboard with updated earnings.
- Check that layouts hold up on a small phone width (e.g. iPhone SE / small
  Android) and a large one (tablet-ish) without overflow.
- No backend/network calls should be required for any of this to work — it
  should all run against the mock repositories.