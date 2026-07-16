# PIA Influence Evaluation Engine — Master Plan (v2)
**Stack:** React + Node/Express + MongoDB
**This replaces v1.** Schemas kept intentionally minimal per your instruction — extend later once you're ready, not now.

---

## 1. Roles (unchanged)

| Role | Core Responsibility |
|---|---|
| **Super Admin** | Categories (+ creates Category Admin at the same time), nominee records, roles/permissions, monitors progress, audit logs, exports |
| **Category Admin** | Manages nominee data within assigned categories, reviews AI screening, assigns jurors (no count limit — many-to-many) |
| **Creator Jury** | Scores nominees off the inserted PDF data only. System auto-shortlists top 10 |
| **Executive Jury** | Scores the system-shortlisted top 10. System auto-shortlists top 5 |
| **Public User** | WhatsApp-OTP login, votes once per category across all categories on the final 5 |
| **Auditor** | Read-only: login logs, creation logs, rating logs — one Logs collection |

---

## 2. Confirmed Flow (v2 — all your answers folded in)

1. **Super Admin** creates a **Category** — name, season — and **in the same form** enters a username/password, which creates the **Category Admin** user account and links it via `categoryAdminId`. Category list shows the admin's username right there.
2. **Super Admin** adds **Nominee** records (minimal — name + category link for now).
3. **Category Admin**:
   - Enters/updates each nominee's platform data (manually keyed from the PDF reports) — schema TBD later, kept out of scope right now.
   - Reviews AI Screening flags.
   - Assigns **Creator Jury** and **Executive Jury** members to their category — no limit, many categories can share the same juror and vice versa.
4. **Creator Jury** logs in, sees nominees **exactly as the PDF data was entered** (no computed "Data Score" shown to them — raw metrics only), scores via rubric, submits.
5. Once all assigned Creator Jurors submit, the **system automatically calculates the average score and ranks nominees, auto-selecting the top 10** — no manual jury override.
6. **Executive Jury** logs in, sees the system-generated **Top 10** directly, clicks a nominee → goes to the rating screen, scores, submits.
7. Once all assigned Executive Jurors submit, the **system automatically ranks and selects the top 5** for public voting.
8. **Public User** logs in via **WhatsApp OTP** (phone number → OTP sent over WhatsApp → verified), then can vote once per category, across every category.
9. **Final Score = Creator Jury + Executive Jury + Public Vote only.** Data Score is **excluded** from the final winner calculation — it exists purely as reference data Category Admin enters and Creator Jury looks at, not as a scored input.
10. **Auditor** sees everything via one **Logs** collection: who logged in and when, who created what, who rated what for whom.

---

## 3. Data Model (minimal, per your direction)

```js
// User
User {
  name, email (unique), phone, passwordHash,
  role: enum ['super_admin','category_admin','creator_jury','executive_jury','auditor'],
  assignedCategoryIds: [ObjectId ref Category],  // many-to-many, no limit
  status: enum ['active','inactive'],
  createdAt, updatedAt
}

// Category — trimmed to your version
Category {
  name: { type: String, required: true },
  season: { type: String, required: true },
  categoryAdminId: ObjectId ref User,
  createdAt, updatedAt
}
// NOTE: on POST, backend creates the Category AND the User(role: category_admin) in one transaction,
// using the username/password submitted from the same form, then sets categoryAdminId.

// Nominee — minimal, as requested. Platform/metric fields deferred to later.
Nominee {
  name: { type: String, required: true },
  categoryId: ObjectId ref Category,
  createdAt, updatedAt
}

// JuryScore — separate schema tied to nominee, as you said
JuryScore {
  nomineeId: ObjectId ref Nominee,
  categoryId: ObjectId ref Category,
  jurorId: ObjectId ref User,
  stage: enum ['creator','executive'],
  criteriaScores: Map,        // { criterionName: points }
  totalScore: Number,
  comments: String,
  status: enum ['draft','submitted'],
  submittedAt,
  createdAt
}

// Shortlist — auto-generated snapshot once a stage's scoring is complete
Shortlist {
  categoryId: ObjectId ref Category,
  stage: enum ['top10','top5'],
  nomineeId: ObjectId ref Nominee,
  avgScore: Number,
  rank: Number,
  computedAt
}

// Voter — public, WhatsApp-OTP based
Voter {
  phone: { type: String, unique: true },
  name: String,             // optional, TBD — see open questions
  otpVerified: Boolean,
  createdAt
}

// PublicVote
PublicVote {
  categoryId: ObjectId ref Category,
  nomineeId: ObjectId ref Nominee,
  voterId: ObjectId ref Voter,
  createdAt
}
// unique index on {categoryId, voterId} enforces one vote per category per voter

// FinalResult
FinalResult {
  categoryId: ObjectId ref Category,
  nomineeId: ObjectId ref Nominee,
  creatorJuryScore, executiveJuryScore, publicVoteScore,
  finalScore, rank,
  lockedAt
}

// Logs — single generic collection for the Auditor role
Logs {
  userId: ObjectId ref User,      // null for public voter actions
  action: String,                 // 'login' | 'category.create' | 'nominee.create' | 'score.submit' | 'vote.cast' etc.
  targetType: String,
  targetId: ObjectId,
  metadata: Mixed,                // e.g. { ratedNomineeId, score } for a rating action
  createdAt
}
```
**7 collections.** No `AIScreeningFlag` schema written yet either — you didn't ask for it to be built out this round, so it's deferred along with the platform/metrics fields on Nominee. Flag if you want it scaffolded now.

---

## 4. Screens (only the parts that changed from v1)

- **Category screen**: create form now includes **Category Admin Username** + **Category Admin Password** fields alongside name/season. List table adds an **Admin** column showing that username.
- **Jury Assignment screen**: no min/max enforcement — just an add/remove multi-select, category-scoped, pulling from Users filtered by role.
- **Creator Jury → "Finalize Top 10"** is no longer a manual action screen. Rename to **"Shortlist Status"** — read-only, shows live ranking, flips to "Top 10 Locked" automatically once every assigned juror has submitted.
- **Executive Jury → "My Finalists"** just loads `Shortlist` where `stage: 'top10'` directly — no admin/jury action needed to see it.
- **Executive Jury → "Finalize Top 5"** same pattern — auto-generated, read-only, becomes the public voting list once complete.
- **Public login** is now phone number → WhatsApp OTP, not email/SMS.
- Everything else from v1 (Nominee list, AI Screening Review, Scoring Panel, Audit viewer) is unchanged in shape, just pointed at the trimmed schemas above.

---

## 5. Open Questions (new, from this round's answers)

1. **Weightage values/location** — with Data Score excluded, the final formula needs Creator Jury / Executive Jury / Public Vote weights (e.g. 40/40/20?). Since you removed `weightage` from Category, where should this live — a single global config, or still per-category later? What are the actual percentages?
2. **WhatsApp OTP provider** — Twilio WhatsApp API, Meta Cloud API, Gupshup, or another? This determines the integration, not just the schema.
3. **Voter identity** — is phone number alone enough to create a `Voter` record, or do you still want name/email captured at WhatsApp-OTP signup?
4. **Stage tracking on Category** — you trimmed `status` out of the Category schema. The UI still needs to know which round is active (e.g. Executive Jury shouldn't see anything until Creator Jury's top 10 exists). Fine to add one small `stage` field back in for this, or do you want the frontend to infer it by querying `Shortlist`/`JuryScore` state instead of storing it?
5. **Auto-publish trigger** — once the last juror in a stage submits, does the system flip to the next stage **instantly and automatically**, or does a Category Admin/Super Admin still need to click something to open the next round?
6. **Nominee "PDF data" fields** — you said Nominee stays minimal for now. When you're ready to add the platform/metrics fields, do you want them embedded on Nominee (one array) or their own collection? No need to answer now — just flagging it's the next thing to design once you're ready.

---

## 6. Build Order (updated)

1. Auth (incl. WhatsApp OTP stub) + User Management
2. Category CRUD (with combined Category Admin creation)
3. Nominee CRUD (minimal)
4. Jury Assignment (no-limit many-to-many)
5. Creator Jury scoring → auto top-10 shortlist logic
6. Executive Jury scoring → auto top-5 shortlist logic
7. Public voting (WhatsApp OTP + one-vote-per-category)
8. Final Result calc (Creator + Executive + Public only) + Logs + Reports





# PIA Influence Evaluation Engine — Master Plan (v3, Phased)
**Stack:** React + Node/Express + MongoDB

---

## 0. Confirmed Since v2

- **Weightage (final):** Creator Jury 30% + Executive Jury 40% + Audience 30%. Data Score stays excluded. Stored as **one global config document**, not per-category (no per-category override requested).
- **Stage transitions are manual** — Super Admin explicitly clicks to start each round (Start Rating Period → Move to Executive Jury → Open Public Voting). Nothing auto-advances just because the last juror submitted.
- **`stage` field added back to Category** — confirmed needed.
- **WhatsApp OTP** — client has their own Broadcast API already; integration point, not a design decision. Need the API docs/credentials before Phase 4.
- **Nominee platform data** — will be a lot, differs per platform (Instagram ≠ Twitter ≠ YouTube). Real fields deferred, but a **skeleton structure** goes in now so Phase 2 has somewhere to grow into.
- **Primary/secondary handles** — nominee profile defaults to showing the primary platform's data; secondary platforms exist as additional tabs on the same screen.
- **Jury creation** — Creator Jury and Executive Jury accounts created under their respective role; a single juror can be attached to multiple categories (many-to-many, no cap).

---

## 1. Roles (unchanged)

| Role | Responsibility |
|---|---|
| Super Admin | Categories (+creates linked Category Admin), nominee shells, jury accounts, stage control, weightage config, audit, exports |
| Category Admin | Nominee data entry within assigned categories, AI screening review, jury assignment to their category |
| Creator Jury | Rates 20 nominees per category off inserted data only |
| Executive Jury | Rates the system-shortlisted top 10 |
| Public User | WhatsApp-OTP login, votes once per category on the final 5 |
| Auditor | Read-only: login / creation / rating logs |

---

## 2. Confirmed Rating & Voting Flow

```
Super Admin clicks "Start Rating Period"
   → Category enters stage: creator_rating
   → Creator Jury sees their assigned 20 nominees, rates each
   → (all Creator Jury for that category submit)

Super Admin clicks "Move to Executive Jury"
   → System computes avg score, auto-shortlists Top 10 → Shortlist(stage:'top10')
   → Category enters stage: executive_rating
   → Executive Jury sees the Top 10, clicks in, rates each
   → (all Executive Jury for that category submit)

Super Admin clicks "Open Public Voting"
   → System computes avg score, auto-shortlists Top 5 → Shortlist(stage:'top5')
   → Category enters stage: public_voting
   → Public logs in via WhatsApp OTP, votes 1 nominee per category

Super Admin locks results
   → FinalScore = (CreatorJuryAvg × 0.30) + (ExecutiveJuryAvg × 0.40) + (PublicVote × 0.30)
   → Category enters stage: completed
```
Every stage transition is a Super Admin action — nothing auto-advances.

---

## PHASE 1 — Core CRUD & Setup
*Goal: everyone can log in, categories+admins exist, nominee shells exist, jurors are created and assigned. No rating logic yet.*

### Schemas
```js
User {
  name, email (unique), phone, passwordHash,
  role: enum ['super_admin','category_admin','creator_jury','executive_jury','auditor'],
  assignedCategoryIds: [ObjectId ref Category],
  status: enum ['active','inactive'],
  createdAt, updatedAt
}

Category {
  name: { type: String, required: true },
  season: { type: String, required: true },
  categoryAdminId: ObjectId ref User,
  stage: { type: String, enum: ['setup','creator_rating','executive_rating','public_voting','completed'], default: 'setup' },
  createdAt, updatedAt
}
// POST creates Category + linked User(role:'category_admin') in one transaction

Nominee {
  name: { type: String, required: true },
  categoryId: ObjectId ref Category,
  createdAt, updatedAt
}

ScoringWeightage {   // singleton, seeded once
  creatorJury: { type: Number, default: 30 },
  executiveJury: { type: Number, default: 40 },
  audienceVote: { type: Number, default: 30 },
  updatedAt
}

Logs {
  userId: ObjectId ref User,
  action: String,          // 'login' | 'category.create' | 'user.create' | 'nominee.create' etc.
  targetType, targetId,
  metadata: Mixed,
  createdAt
}
```

### Screens
- Login (all roles)
- Super Admin → **Category** (list + create/edit, one page): name, season, Category Admin username, Category Admin password. List shows admin username + stage badge.
- Super Admin → **User/Jury Management** (list + create/edit): name, email, phone, role dropdown (Category Admin / Creator Jury / Executive Jury / Auditor), status.
- Super Admin/Category Admin → **Nominee** (list + create): name, category. Minimal for now.
- Category Admin → **Jury Assignment**: add/remove jurors per category, filtered by role, no count limit.

### APIs
`POST/GET /api/auth/*` · `GET/POST/PUT /api/categories` (transactional admin creation) · `GET/POST/PUT /api/users` · `GET/POST /api/nominees` · `POST/DELETE /api/categories/:id/jury-assignment`

---

## PHASE 2 — Nominee Data Population
*Goal: build the profile-completion screens. Nominee data can be saved as draft and edited/finished later. Platform tabs are skeletal — structure only, real fields added once you design them.*

### Schema addition
```js
Nominee {
  // ...Phase 1 fields
  profileStatus: { type: String, enum: ['draft','complete'], default: 'draft' },
  platforms: [{
    platformType: { type: String, enum: ['instagram','twitter','youtube','tiktok','facebook'] },
    isPrimary: { type: Boolean, default: false },
    data: Schema.Types.Mixed    // placeholder — real per-platform fields designed later
  }]
}
```

### Screens
- **Nominee Profile Edit** — tabbed by platform. Primary platform's tab is shown/selected by default; secondary platforms appear as additional tabs on the same screen. Each tab currently just has a generic data block (placeholder fields) since the real per-platform schema isn't designed yet.
- **Save Draft / Save & Continue Later** — button on the profile edit screen; doesn't require all tabs filled to save.
- Nominee list updates to show `profileStatus` (draft/complete) as a column/filter.

### APIs
`PUT /api/nominees/:id/platforms/:platformType` (upsert one platform's data block) · `PUT /api/nominees/:id/profile-status`

### Not building yet
Actual Instagram/Twitter/YouTube-specific field sets — flagged for a follow-up design pass once you're ready, not blocking Phase 1/2 structurally.

---

## PHASE 3 — Rating Screens (Creator Jury + Executive Jury)
*Goal: get scoring working end-to-end. Screens are minimal now — expect them to grow once Phase 2's real nominee fields exist, since jurors will eventually see more data on the same screen.*

### Schemas
```js
JuryScore {
  nomineeId: ObjectId ref Nominee,
  categoryId: ObjectId ref Category,
  jurorId: ObjectId ref User,
  stage: enum ['creator','executive'],
  criteriaScores: Map,       // { criterionName: points }
  totalScore: Number,
  comments: String,
  status: enum ['draft','submitted'],
  submittedAt, createdAt
}

Shortlist {
  categoryId: ObjectId ref Category,
  stage: enum ['top10','top5'],
  nomineeId: ObjectId ref Nominee,
  avgScore: Number,
  rank: Number,
  computedAt
}
```

### Screens
- Super Admin → **Stage Control** (per category): shows current `stage`, buttons — "Start Rating Period," "Move to Executive Jury," "Open Public Voting" — each only enabled once the prior round's submissions are in (soft gate, admin can still force it).
- Creator Jury → **My Nominees** (20 per category, from whatever's in Phase 2's `platforms` data, however complete it is at the time), **Scoring Panel** (criteria inputs + comments + submit).
- Executive Jury → **My Finalists** (reads `Shortlist` where `stage:'top10'`, read-only until Admin opens the round), **Scoring Panel** (same pattern).

### APIs
`POST /api/jury-scores/draft` · `POST /api/jury-scores/submit` · `POST /api/categories/:id/stage/advance` (Super Admin only — computes `Shortlist` and flips `Category.stage`)

---

## PHASE 4 — Public Voting
*Goal: public-facing screens, WhatsApp OTP via your Broadcast API, one vote per nominee per category on the final 5.*

### Schemas
```js
Voter {
  phone: { type: String, unique: true },
  name: String,           // capture at signup? — open question, see below
  otpVerified: Boolean,
  createdAt
}

PublicVote {
  categoryId: ObjectId ref Category,
  nomineeId: ObjectId ref Nominee,
  voterId: ObjectId ref Voter,
  createdAt
}
// unique index { categoryId, voterId } enforces one vote per category per voter
```

### Screens
- **Public Landing** — all categories, each showing its `Shortlist(stage:'top5')`.
- **WhatsApp OTP Login** — phone number → OTP via Broadcast API → verify.
- **Vote Flow** — pick 1 nominee per category, confirmation screen.
- **My Votes** — which categories already voted in.

### APIs
`POST /api/vote/otp/send` (Broadcast API integration) · `POST /api/vote/otp/verify` · `POST /api/vote` · `GET /api/vote/my-votes`

### Prerequisite before building
Broadcast API docs/credentials from client — this is an integration blocker, not a design one.

---

## PHASE 5 — Results, Weightage & Audit
*Goal: close the loop — final scoring, audit visibility, exports.*

### Schema
```js
FinalResult {
  categoryId: ObjectId ref Category,
  nomineeId: ObjectId ref Nominee,
  creatorJuryScore, executiveJuryScore, publicVoteScore,
  finalScore, rank,
  lockedAt
}
```

### Screens
- Super Admin → **Final Results**: per category, shows the 30/40/30 breakdown per finalist, "Lock Results" button.
- Auditor/Super Admin → **Logs Viewer**: filter by user/action/entity/date, exportable.
- Super Admin → **Reports & Exports**: winner sheet, category scorecards, jury completion report — CSV/PDF.

### APIs
`POST /api/categories/:id/results/calculate` (applies `ScoringWeightage`) · `POST /api/categories/:id/results/lock` · `GET /api/audit-logs` · `GET /api/reports/:type`

---

## Remaining Open Questions

1. **Voter identity** — is phone number + OTP alone enough to create a `Voter`, or do you want name captured too at signup?
2. **Tie-break rule** — if two nominees land on the exact same final score, how is the winner decided?
3. **Stage rollback** — can Super Admin move a category *backward* (e.g. reopen Creator Jury rating after already moving to Executive Jury) if a mistake is found? Should it require a logged reason?
4. **Broadcast API details** — need the actual docs/credentials/sender ID before Phase 4 work starts.
5. **Per-platform nominee fields** — still to be designed together (Instagram vs Twitter vs YouTube field sets) before Phase 2's tabs get real content — flagged, not blocking now.