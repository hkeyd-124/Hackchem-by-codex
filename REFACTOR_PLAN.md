# Refactor Plan (Safe, No Logic Break)

## 1) Current architecture snapshot

### What is already working well
- Email login + email verification flow is already implemented and returns a clear state (`NOT_VERIFIED`) to the UI.
- User indexing strategy (`email_index`, `wallet_index`) is practical and scalable for lookup.
- Daily check-in and points/streak are implemented and persisted to Firestore.
- Lesson progress/best score logic already supports local persistence and partial migration from wallet-based keys to uid-based keys.

### Main refactor risks (if done too aggressively)
1. **Identity source is inconsistent** in many places (`uid`, `wallet`, fallback to `guest`) so careless cleanup can break old users.
2. **Business logic is embedded in HTML pages** (index/home/lesson pages), making it hard to test and safely change.
3. **Firebase initialization is duplicated** and config is exposed in multiple files.
4. **Side effects via localStorage are spread across modules**, causing hidden coupling.
5. **AI endpoint has no strict schema validation**, so malformed model output could break quiz rendering.

---

## 2) Refactor target state

Move toward a layered design while preserving behavior:

- `core/auth/` → login, session, identity resolution.
- `core/user/` → user profile, wallet/email linking, ban status.
- `core/points/` → streak/check-in/reward logic.
- `core/lesson/` → progress + scoring state machine.
- `infra/firebase/` → app/db/auth singleton + typed collection helpers.
- `ui/` → pure rendering + event wiring only.

> Rule: UI pages should call service functions; service functions should be the only place touching Firestore/localStorage for that domain.

---

## 3) Safe migration strategy (không phá logic cũ)

## Phase 0 — Freeze behavior (baseline)
1. Add a “behavior checklist” from current flows:
   - Email login verified/unverified/new account.
   - Wallet connect with existing index and conflict case.
   - Daily check-in points + streak update.
   - Lesson scoring progression and ranking thresholds.
2. Add minimal smoke tests (can be Playwright or lightweight JS integration scripts).
3. Capture baseline data snapshots for a test account.

## Phase 1 — Centralize identity/session
1. Create `sessionService`:
   - `getCurrentIdentity()` returns normalized `{ uid, wallet, isGuest }`.
   - `setCurrentUid(uid)` / `clearSession()` wrappers.
2. Replace direct `localStorage.getItem("uid") || localStorage.getItem("wallet")` with this service.
3. Keep compatibility adapter for old keys (wallet-based) during transition.

## Phase 2 — Extract domain services (no UI change)
1. Extract from `home.html`:
   - check-in/streak/points logic into `pointsService`.
2. Extract from `lesson/*.html`:
   - scoring + save/resume logic into `lessonProgressService`.
3. Keep existing thresholds and formulas unchanged (`gold/silver`, +/- score rules).

## Phase 3 — Harden backend boundary
1. In `api/chat.js`, validate request body and response JSON shape.
2. Add timeout + retry policy for OpenAI call.
3. Add server-side guardrails for `mode=quiz` output schema.

## Phase 4 — Data and schema hygiene
1. Define single `User` schema and update helper.
2. Use one migration script for:
   - missing `providers` object.
   - inconsistent `wallet_index/email_index` docs.
3. Add idempotent migration logs.

---

## 4) Technical guardrails to prevent regression

1. **Compatibility-first**: never delete old localStorage keys immediately; read old + write new for 1-2 versions.
2. **Feature flags**: switch each extracted service behind small runtime flags.
3. **Contract tests** around:
   - login return values (`uid`, `NOT_VERIFIED`, `null`).
   - banned user block.
   - check-in reward table by streak.
   - lesson rank boundaries.
4. **Firestore writes are wrapped** in dedicated methods so behavior is auditable.

---

## 5) Quick wins you can do first (1-2 days)

1. Create `src/services/sessionService.js` and replace identity reads in `home.html`, `courses.html`, `lesson/*.html`.
2. Create `src/services/firebaseClient.js` to stop duplicated init code.
3. Move check-in reward function + streak update into `pointsService` without changing formula.
4. Add `zod` (or manual validator) in `api/chat.js` response parsing.

---

## 6) Suggested acceptance checklist after each phase

- User can still login by email and gets verification prompts correctly.
- Existing users still see previous points/streak/progress.
- Wallet linking still prevents linking wallet already owned by another uid.
- Lesson score totals and rank labels remain exactly the same for same actions.
- No new Firestore collections are required to run old flows.

---

## 7) Priority recommendation for your project

Given your current strengths (login + scoring + firebase stable), the best ROI path is:

1. **Identity/session normalization first** (highest risk reducer).
2. **Extract points/check-in service second** (high reuse).
3. **Extract lesson engine third** (largest file cleanup).
4. **API schema hardening fourth** (stability for AI feature).

This keeps current business logic intact while progressively improving maintainability.
