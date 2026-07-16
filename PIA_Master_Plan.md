# PIA Influence Evaluation Engine — Master Plan (v4, Consolidated)
**Stack:** React (Vite) + Node/Express + MongoDB (Mongoose)
**Status of this document:** Supersedes v1/v2/v3 below. Those are kept at the bottom as historical record — this section is the one to build from.

---

## 1. What This Project Is

PIA is an **awards/influence evaluation platform**. Nominees (influencers) are entered per category, scored across two jury rounds, then voted on by the public. The final winner is a weighted blend of jury + public scores — **not** the raw platform "Data Score", which exists only as reference material for the first jury round.

**Pipeline:** Super Admin sets up categories & accounts → Category Admin populates nominee data & assigns jurors → Creator Jury scores all nominees off raw data → system auto-shortlists Top 10 → Executive Jury scores the Top 10 → system auto-shortlists Top 5 → Public votes via WhatsApp OTP on the Top 5 → Super Admin locks final results → Auditor reviews everything.

### Roles

| Role | Core Responsibility |
|---|---|
| **Super Admin** | Categories (+ creates linked Category Admin), nominee shells, jury accounts, stage control per category, weightage config, audit, exports |
| **Category Admin** | Nominee data entry within assigned categories, AI screening review, jury assignment (many-to-many, no cap) |
| **Creator Jury** | Scores nominees off inserted platform data only (no computed Data Score shown) |
| **Executive Jury** | Scores the system-shortlisted Top 10 |
| **Public User** | WhatsApp-OTP login, votes once per category on the final 5 |
| **Auditor** | Read-only: login / creation / rating logs, one `Logs` collection |

### Confirmed Business Rules

1. **Weightage (final):** Creator Jury 30% + Executive Jury 40% + Audience 30%. Data Score is **excluded** from the final score — reference-only for Creator Jury.
2. **Stage transitions are manual.** Super Admin explicitly clicks "Start Rating Period" → "Move to Executive Jury" → "Open Public Voting" → "Lock Results". Nothing auto-advances just because the last juror submitted.
3. Category creation happens **together with** its Category Admin account (one form, one submit).
4. Jury accounts are many-to-many with categories — no min/max.
5. Nominee platform data (Instagram/Twitter/YouTube/etc.) will be extensive and differs per platform — a **skeleton structure** goes in now (`platforms: [{ platformType, isPrimary, data: Mixed }]`), real fields designed later. Primary platform shown by default; secondary platforms as extra tabs on the same screen.
6. Public voting is WhatsApp OTP via the **client's own Broadcast API** — integration detail, not a design decision, blocked on credentials/docs.

---

## 2. Current Progress Snapshot (as of this plan)

This is graded honestly against the schema/plan above so nothing gets silently skipped.

### Backend (`PIA-backend`)
| Area | Status | Notes |
|---|---|---|
| Express + Mongoose setup | ✅ Done | `app.js`, `index.js`, `config/db.js` |
| Auth (`/api/register`, `/api/login`) | ✅ Done | JWT (`x-auth-token` header), 10h expiry. **No role-based route guard** — `protect` middleware only checks the token is valid, not the caller's role. |
| `User` model | ⚠️ Partial | Has `name, email, password, role, season` — matches plan loosely, but has no `assignedCategoryIds`, `phone`, or `status` fields yet. |
| `Category` model + CRUD | ✅ Mostly done | Has `stage` enum already. Combined admin-account creation on `createCategory` works, but is **not wrapped in a Mongo transaction** — if `Category.create` fails after `User.create` succeeds, you get an orphaned admin user. |
| `Jury` model + CRUD | ⚠️ Deviates from plan | Jury is a **separate collection** with its own `username/password`, duplicated into `Users` on create/update/delete to allow login. This is data duplication/drift risk instead of the planned single `User` model with `role: creator_jury / executive_jury`. Also `categories` is stored as an **array of category name strings**, not `ObjectId` refs — renaming a category silently breaks every assignment. |
| `Nominee` model/CRUD | ❌ Not started | Phase 1 blocker — nothing exists yet. |
| `ScoringWeightage`, `Logs`, `JuryScore`, `Shortlist`, `Voter`, `PublicVote`, `FinalResult` | ❌ Not started | All of Phases 3–5 backend work is pending. |
| Stage transition API (`/categories/:id/stage/advance`) | ❌ Not started | `Category.stage` field exists but nothing reads/writes it yet. |
| Multer config | 🟡 Present, unused | `config/multer.js` exists but jury photo upload currently goes through base64 in the request body, not multer. |

### Frontend (`PIA-frontend`)
| Area | Status | Notes |
|---|---|---|
| Login + `AuthProvider` (localStorage token/user) | ✅ Done | Email/password only — WhatsApp OTP is an entirely separate, unbuilt flow for Phase 5 (Public User isn't even the same app surface). |
| Dashboard shell (`Sidebar`, `DashboardHeader`, layout) | ✅ Done | Nav currently only has **Overview / Categories / Jury** — will need Nominee, Stage Control, Scoring, Shortlist, Voting, Results, Audit Log added incrementally. |
| Categories screen | ✅ Done | Create form + admin username/password, table with search/season filter, delete. Matches Phase 1 spec. |
| Jury screen | ✅ Done | Create form (name/type/username/password/photo), table with search/type filter, category assignment via toggle badges, delete. **No dedicated "Jury Assignment" screen** — assignment is inline in the Jury table rather than scoped to a Category Admin's assigned categories per the plan. |
| Dashboard Overview (`DashboardHome`) | ⚠️ Mostly placeholder | `MetricsCards` shows **hardcoded mock numbers** (`dashboardData.js`: "Total Nominees: 47", "Total Jurors: 6", etc.), not live API data. `CallVolumeChart`, `SentimentBar`, `WordBubble`, `HourlyAnalyticsChart`, `TopKeyWords`, `CallLogTable` are **leftover components from an unrelated prior project** (`package.json` name is still `voice-admin` / backend is `unilever-campaign-backend` — a call-center/voice-campaign dashboard template that was repurposed). Most are commented out in JSX but still present in the codebase. |
| Nominee screens | ❌ Not started | |
| Scoring / Shortlist / Voting / Results / Audit screens | ❌ Not started | |

**Bottom line:** what's built so far is roughly **half of Phase 1** from the old v3 plan (Category CRUD ✅, User/Jury management ⚠️ built but off-model, RBAC ❌, Nominee ❌). Everything from Phase 2 onward is a clean slate.

---

## 3. Final Data Model (target state — consolidate to this)

```js
User {
  name, email (unique), phone, passwordHash,
  role: enum ['super_admin','category_admin','creator_jury','executive_jury','auditor'],
  assignedCategoryIds: [ObjectId ref Category],   // many-to-many, no limit — replaces string-array on Jury
  status: enum ['active','inactive'],
  createdAt, updatedAt
}
// NOTE: Jury should be folded into User (role: creator_jury/executive_jury) instead of
// staying a separate mirrored collection — removes the current dual-write drift risk.

Category {
  name, season,
  categoryAdminId: ObjectId ref User,
  stage: enum ['setup','creator_rating','executive_rating','public_voting','completed'],
  createdAt, updatedAt
}
// POST creates Category + linked User(role:'category_admin') in one transaction (use a Mongo session).

Nominee {
  name, categoryId: ObjectId ref Category,
  profileStatus: enum ['draft','complete'],
  platforms: [{ platformType: enum [...], isPrimary: Boolean, data: Mixed }],  // skeleton, real fields TBD
  createdAt, updatedAt
}

ScoringWeightage {   // singleton, seeded once
  creatorJury: Number (default 30),
  executiveJury: Number (default 40),
  audienceVote: Number (default 30),
  updatedAt
}

JuryScore {
  nomineeId, categoryId, jurorId: ObjectId refs,
  stage: enum ['creator','executive'],
  criteriaScores: Map, totalScore: Number, comments: String,
  status: enum ['draft','submitted'], submittedAt, createdAt
}

Shortlist {
  categoryId, nomineeId: ObjectId refs,
  stage: enum ['top10','top5'],
  avgScore: Number, rank: Number, computedAt
}

Voter {
  phone: { unique: true }, name, otpVerified: Boolean, createdAt
}

PublicVote {
  categoryId, nomineeId, voterId: ObjectId refs, createdAt
}
// unique index { categoryId, voterId } → one vote per category per voter

FinalResult {
  categoryId, nomineeId: ObjectId refs,
  creatorJuryScore, executiveJuryScore, publicVoteScore,
  finalScore, rank, lockedAt
}

Logs {
  userId: ObjectId ref User,   // null for public voter actions
  action: String,              // 'login' | 'category.create' | 'score.submit' | 'vote.cast' etc.
  targetType, targetId, metadata: Mixed, createdAt
}
```
**10 collections** once `Jury` is folded into `User`. Nominee's `platforms.data` and the AI-screening flag schema stay deferred by design — flagged, not blocking.

---

## 4. Phases (organized by role, in pipeline order)

### Phase 0 — Foundation Fixes *(do this before Phase 2 work, it's cheap now and expensive later)*
Not a role phase — closes gaps in what's already built so later phases don't inherit them.
- Add **role-based authorization middleware** (`requireRole('super_admin', ...)`) on top of `protect`; currently any authenticated user can call any endpoint.
- Wrap `createCategory`'s admin-user + category creation in a Mongo transaction (session) so a failure can't orphan a `User` record.
- Decide now: fold `Jury` into `User` (role: `creator_jury`/`executive_jury`) and switch `categories` from name-strings to `assignedCategoryIds: [ObjectId]`, or explicitly accept the current dual-collection design permanently. Recommend folding — it directly unblocks Phase 3/4 scoring queries (`JuryScore.jurorId` needs to point at a real user record) and removes the rename-breaks-assignment bug.
- Remove or relocate the leftover call-center dashboard components (`CallLogTable`, `CallVolumeChart`, `SentimentBar`, `WordBubble`, `HourlyAnalyticsChart`, `TopKeyWords`) and replace `dashboardData.js` mock metrics with live counts once real collections exist. Low urgency but do it before Overview becomes a real dashboard in Phase 2, to avoid stacking new widgets on top of dead code.

### Phase 1 — Super Admin: Setup & Control
*Goal: accounts, categories, nominee shells, jury accounts all exist. No rating logic yet.*

| | Status |
|---|---|
| Category CRUD + linked admin creation | ✅ Done (needs Phase 0 transaction fix) |
| User/Jury management on the unified `User` model | ⚠️ Rework — currently the separate `Jury` collection |
| Nominee shell CRUD (name + category link) | ❌ To build |
| `ScoringWeightage` singleton (seed 30/40/30) | ❌ To build |
| Stage field on Category | ✅ Schema done, 🔲 no control UI/API yet |

**Screens:** Category (done) · User/Jury Management (rework onto unified model) · Nominee list+create (new) · Weightage config (new, Super Admin only, likely a simple settings screen).
**APIs:** existing `/categories`, `/juries` (migrate to `/users?role=...`) · new `GET/POST /api/nominees` · new `GET/PUT /api/weightage`.

### Phase 2 — Category Admin: Nominee Data & Jury Assignment
*Goal: profile-completion screens for nominees; jury assignment scoped to a Category Admin's own categories.*

- `Nominee.platforms` skeleton (per §3) + `profileStatus` draft/complete.
- **Nominee Profile Edit** screen — tabbed by platform, primary tab shown by default, "Save Draft" doesn't require all tabs filled.
- **Jury Assignment** screen, scoped by category (replaces the current global toggle-grid in the Jury table) — Category Admin only sees/assigns within `req.user.assignedCategoryIds`.
- AI Screening Review screen — still deferred per original plan (no `AIScreeningFlag` schema written yet; flag if you want it scaffolded).
**APIs:** `PUT /api/nominees/:id/platforms/:platformType` · `PUT /api/nominees/:id/profile-status` · `POST/DELETE /api/categories/:id/jury-assignment`.

### Phase 3 — Creator Jury: Round 1 Scoring
*Goal: Creator Jury can score; Super Admin can open/close the round; system auto-shortlists Top 10.*

- `JuryScore` + `Shortlist` schemas.
- Super Admin → **Stage Control** screen (per category): "Start Rating Period" button, live status.
- Creator Jury → **My Nominees** (their assigned category's nominees, raw platform data only, no Data Score shown) → **Scoring Panel** (criteria inputs, comments, draft/submit).
- Super Admin → "Move to Executive Jury" button computes avg scores → writes `Shortlist(stage:'top10')` → flips `Category.stage`.
**APIs:** `POST /api/jury-scores/draft` · `POST /api/jury-scores/submit` · `POST /api/categories/:id/stage/advance`.

### Phase 4 — Executive Jury: Round 2 Scoring
*Goal: same pattern as Phase 3, scoped to the Top 10.*

- Executive Jury → **My Finalists** (reads `Shortlist` where `stage:'top10'`, locked/read-only until Super Admin opens the round) → same **Scoring Panel** component reused from Phase 3.
- Super Admin → "Open Public Voting" button computes avg scores → writes `Shortlist(stage:'top5')` → flips `Category.stage`.

### Phase 5 — Public User: WhatsApp OTP Voting
*Goal: separate public-facing surface (likely its own small app/route group, not behind the admin dashboard login).*
**Blocked on:** client's Broadcast API docs/credentials — integration blocker, not a design one. Do not start build until credentials are in hand.

- `Voter`, `PublicVote` schemas.
- **Public Landing** — categories with their `Shortlist(stage:'top5')`.
- **WhatsApp OTP Login** — phone → OTP via Broadcast API → verify.
- **Vote Flow** — one nominee per category, confirmation screen.
- **My Votes** — which categories already voted in.
**APIs:** `POST /api/vote/otp/send` · `POST /api/vote/otp/verify` · `POST /api/vote` · `GET /api/vote/my-votes`.

### Phase 6 — Auditor & Final Results
*Goal: close the loop — weighted final score, audit trail, exports.*

- `FinalResult`, `Logs` schemas. `Logs` should actually start being written from Phase 0 onward (login events at minimum) rather than bolted on retroactively — cheapest to wire in as each action is built.
- Super Admin → **Final Results**: 30/40/30 breakdown per finalist, "Lock Results" button.
- Auditor/Super Admin → **Logs Viewer**: filter by user/action/entity/date, exportable.
- Super Admin → **Reports & Exports**: winner sheet, category scorecards, jury completion report (CSV/PDF — `xlsx` package is already a backend dependency, unused so far).
**APIs:** `POST /api/categories/:id/results/calculate` · `POST /api/categories/:id/results/lock` · `GET /api/audit-logs` · `GET /api/reports/:type`.

---

## 5. Screens Inventory (status at a glance)

| Screen | Role | Status |
|---|---|---|
| Login | All | ✅ Done (email/password only) |
| Category list/create | Super Admin | ✅ Done |
| User/Jury Management | Super Admin | ⚠️ Built off-model, needs rework onto unified `User` |
| Nominee list/create (shell) | Super Admin | ❌ Not started |
| Weightage config | Super Admin | ❌ Not started |
| Stage Control | Super Admin | ❌ Not started (schema field exists) |
| Nominee Profile Edit (tabbed) | Category Admin | ❌ Not started |
| Jury Assignment (category-scoped) | Category Admin | ⚠️ Exists inline, not scoped/dedicated |
| AI Screening Review | Category Admin | ❌ Deferred by design |
| My Nominees + Scoring Panel | Creator Jury | ❌ Not started |
| My Finalists + Scoring Panel | Executive Jury | ❌ Not started |
| Public Landing / OTP Login / Vote Flow / My Votes | Public User | ❌ Not started, blocked on Broadcast API creds |
| Final Results | Super Admin | ❌ Not started |
| Logs Viewer | Auditor | ❌ Not started |
| Reports & Exports | Super Admin | ❌ Not started |
| Dashboard Overview | All (admin roles) | ⚠️ Mock data + leftover unrelated widgets, needs real metrics once collections exist |

---

## 6. Open Questions (unresolved, carried forward)

1. **Voter identity** — is phone + OTP alone enough to create a `Voter`, or capture name too at signup?
2. **Tie-break rule** — if two nominees land on the exact same final score, how is the winner decided?
3. **Stage rollback** — can Super Admin move a category *backward* (e.g. reopen Creator Jury rating after already moving to Executive Jury)? Should it require a logged reason?
4. **Broadcast API details** — need actual docs/credentials/sender ID before Phase 5 work starts.
5. **Per-platform nominee fields** — Instagram vs Twitter vs YouTube field sets still to be designed before Phase 2's tabs get real content.
6. **Jury/User consolidation call** — confirm you want Phase 0's fold of `Jury` into `User` (recommended) rather than keeping the current dual-collection approach.

---

## 7. Recommended Immediate Next Steps

1. Decide on the Phase 0 items (role middleware, transaction fix, Jury→User fold) — these are small now, painful to retrofit once Scoring/Shortlist logic references `jurorId`.
2. Build Nominee shell CRUD (Phase 1) — it's the one missing piece blocking everything downstream (jury scoring has nothing to score without it).
3. Chase down Broadcast API credentials in parallel — it's the only external dependency and the biggest schedule risk if left to Phase 5.

---
---

# Historical Record — Superseded Drafts (v1/v2/v3)

*Kept for reference only. Do not build against this section — see the consolidated plan above.*

## v2 highlights
- 7-collection minimal schema (User, Category, Nominee, JuryScore, Shortlist, Voter, PublicVote, FinalResult, Logs).
- Stage transitions were still open — later confirmed manual in v3.
- Weightage location was an open question — later confirmed as a global `ScoringWeightage` singleton (30/40/30) in v3.

## v3 highlights
- Introduced explicit 5-phase build order (Core CRUD → Nominee Data → Rating → Public Voting → Results/Audit).
- Confirmed weightage 30/40/30, manual stage transitions, `stage` field back on Category, WhatsApp OTP via client's own Broadcast API, nominee platform skeleton with primary/secondary tabs.

*(Full original v2/v3 text has been superseded and removed from this file to avoid duplication — the consolidated sections above fold in every confirmed decision from both.)*
