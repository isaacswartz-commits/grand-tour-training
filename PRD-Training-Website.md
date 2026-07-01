# PRD — "Grand Tour" Personal Training Website

**Owner:** [you]
**Status:** v1 spec, ready for build
**Last updated:** July 1, 2026
**Plan dates:** **Mon July 6 – Sun Sept 27, 2026** (12 weeks, Monday-aligned). Race day: **Thu Sept 24, 2026** — falls inside Week 12; taper runs slightly into race week by design (see §6).
**Purpose:** A fun, pixel-art, mobile-first training app that keeps the athlete engaged through a fixed 12-week plan for a 2-day self-supported MTB ultra. Completing each workout ("stage") triggers a pixel peloton sprinting to a finish line. Strength sessions run as a guided, audio-cued, class-style workout. Weight and body-fat are tracked manually.

---

## 1. Goals & Non-Goals

### Goals (v1)
- Present the 12-week plan as a **dated calendar** of 84 sessions ("stages"), each with phase-correct volumes.
- Make completing a workout **satisfying** — pixel peloton + finish line, progress bar toward 84.
- Give **bike sessions** a clean detail view + one-tap complete.
- Give **strength sessions** a full **guided runner** (HUD, timers, audio cues, looping pixel demos).
- Layer audio cues **over the user's own music** (OS mixing) — no Spotify integration.
- Track **weight + body-fat %** via manual entry with a two-line trend chart.
- **Sync across phone + iPad** via email/password login and a hosted DB.

### Non-Goals (deferred to post-v1)
- Exercise/animation **authoring from the website** (CRUD admin). v1 hardcodes exercises cleanly so this is easy to add later.
- **Bluetooth scale** integration (Web Bluetooth is unsupported in iOS/iPadOS Safari; primary devices can't use it). Manual entry only for now.
- Smooth, fully-animated multi-frame exercise loops. v1 uses **simple looping** (2–4 frames) + static hero poses.
- Multi-user / coaching / social features. Single athlete.
- Native app. This is a responsive web app (installable as a PWA is a nice-to-have, not required).

---

## 2. Target Devices & Constraints

- **Primary:** phone (portrait, ~380px) and **iPad** (both orientations). Design mobile-first; iPad gets a roomier layout, not a different app.
- **Audio unlock:** iOS/iPadOS only allows Web Audio + SpeechSynthesis after a user gesture. The **"Tackle this Workout"** tap is the unlock point for strength; a bike "Complete" tap is enough for its (minimal) audio.
- **OS mixing:** app cues play *over* whatever music app is running — no ducking, no Spotify API. This is by design and requires no integration.
- **No Web Bluetooth reliance** (unsupported on the primary devices).

---

## 3. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | **Vite + React** | Fast, simple, great in Cursor |
| Styling | Tailwind CSS + a small pixel-art design layer | Utility speed + custom retro treatment |
| State/data | **Supabase** (Postgres, Auth, Realtime) | Real cross-device sync, email/password auth, generous free tier, minimal backend code |
| Charts | Recharts (or lightweight equiv.) | Weight/BF two-line trend |
| Audio | Web Audio API (beeps) + SpeechSynthesis (voice) | Free, offline, layers over music, no keys |
| Hosting | **Vercel** (or Netlify) | One-command deploy, env vars for Supabase keys |
| Repo | New GitHub repo | Doesn't exist yet — setup covered below |

---

## 4. Data Model (Supabase / Postgres)

All tables are single-user but scoped by `user_id` with Row Level Security (RLS) so only the logged-in user reads/writes their rows.

### `plan_days` (the 84 dated sessions — can be seeded, not user-generated)
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| date | date | Specific calendar day |
| week | int | 1–12 |
| phase | int | 1–4 |
| type | text | `bike` \| `strength` |
| slug | text | e.g. `strength_a`, `sweet_spot`, `vo2`, `tempo`, `long_ride`, `strength_b`, `strength_c` |
| title | text | Display name |
| detail | jsonb | Full session content (see §7) — phase-specific volumes baked in |

### `completions`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK | |
| plan_day_id | uuid FK | |
| completed_at | timestamptz | When marked |
| via | text | `guided` \| `manual` |
| winner_index | int | Which peloton rider won (so it's stable on re-view) |

### `day_moves` (intra-week reschedules)
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK | |
| plan_day_id | uuid FK | |
| moved_to_date | date | Must be in the **same week** as original (validated app-side + DB check) |

### `weight_entries`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK | |
| date | date | |
| weight_lb | numeric | |
| bodyfat_pct | numeric | Nullable |

### `settings` (single row per user)
| Column | Type | Notes |
|---|---|---|
| user_id | uuid PK/FK | |
| ftp_watts | int | Seed at **257**. Drives computed watts on bike intervals (§7). One value to update after a retest. |

### `exercises` (hardcoded/seeded in v1; table exists so authoring can be added later)
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| slug | text | `kb_swing`, `goblet_press`, `single_arm_row`, `pushup_row`, `single_leg_rdl`, `hip_hike`, `bird_dog`, `dead_bug`, `side_plank`, `plank_shoulder_tap`, `turkish_getup`, `farmer_carry`, warm-up moves, etc. |
| name | text | |
| cue | text | Short form/safety cue (incl. hip reminders) |
| asset | text | Path to illustrated/anime-style figure asset (reference-image style, NOT pixel sprites). Placeholder silhouette in v1, swapped later. |
| mode | text | `timed` (40/20 circuit moves) \| `tap` (warm-ups, get-ups, carries, ab-finisher moves) |

**Seed list is not closed — every slug referenced in §8 circuits must exist as a row.** At minimum seed: warm-up (`band_lateral_walk`, `clamshell`, `band_pull_apart`, `hip_9090`); circuit (`kb_swing`, `goblet_press`, `single_arm_row`, `pushup_row`, `single_leg_rdl`, `hip_hike`, `bird_dog`, `dead_bug`, `side_plank`, `plank_shoulder_tap`); Strength C (`turkish_getup`, `farmer_carry`); ab finisher + gym swaps (`reverse_crunch`, `russian_twist`, `plank`, `hanging_leg_raise`, `cable_woodchop`). Ab-finisher and gym-swap moves are `mode = tap`.

---

## 5. Information Architecture / Screens

1. **Calendar (home)** — progress bar at top (`X / 84 stages`), the 12-week schedule, today highlighted, missed days greyed, tap a day → session screen.
2. **Bike Session** — detail (intervals, targets, fueling notes) + **Complete Workout**.
3. **Strength Session — Breakdown** — what the session is, rounds, exercise list, hip notes + **Tackle this Workout**.
4. **Strength Session — Guided Runner** — the HUD experience (§8).
5. **Completion Celebration** — pixel peloton → finish line, updates progress bar.
6. **Body Metrics** — weight + BF entry form + two-line trend chart.
7. **Auth** — email/password sign-in.

Bottom nav (mobile): **Calendar · Metrics · (Profile/Logout)**.

---

## 6. Calendar & Completion Rules

- **84 dated sessions**, weekly template: Mon Strength A · Tue Sweet Spot · Wed Strength B · Thu VO2 · Fri Tempo · Sat Long Ride · Sun Strength C.
- **Plan runs Mon July 6 → Sun Sept 27, 2026**, Monday-aligned. Week 1 = July 6–12.
- **Phase boundaries (4 / 4 / 2 / 2):**
  - Phase 1 **Foundation** — Weeks 1–4 (Jul 6 – Aug 2)
  - Phase 2 **Build** — Weeks 5–8 (Aug 3 – Aug 30)
  - Phase 3 **Peak** — Weeks 9–10 (Aug 31 – Sep 13)
  - Phase 4 **Taper** — Weeks 11–12 (Sep 14 – Sep 27)
- **Race day = Thu Sept 24**, inside Week 12. **Option A chosen:** keep all 12 full weeks; the taper running slightly into race week is fine. No compression. (The seed may optionally mark Sept 24 with a race flag, but the 84 sessions are unchanged.)
- **Move within same week only.** UI offers reschedule; blocks cross-week moves. Original slot shows "moved."
- **Every session = one stage.** Progress bar = completed count / 84.
- **Manual complete** always available on any session (rode outside / gym off-script).
- **Retroactive completion** allowed for **any past day** in the plan.
- **Missed past days** render greyed / "missed" (accountability tone, chosen by owner).
- **Peloton fires** on every completion. Random winner among 4–5 riders, **never the same winner twice in a row**; store `winner_index` so re-viewing the day is consistent.

---

## 7. Session Content (baked per phase)

The `detail` jsonb carries phase-correct numbers. **The seed is the single source of truth for all volumes** — the tables below are deterministic (every "3–4" range is resolved to a specific per-week number so no session is ambiguous).

#### Bike volumes — week by week (deterministic)

| Wk | Phase | Sweet Spot (Tue) | VO2 (Thu) | Long Ride (Sat) | Notes |
|---|---|---|---|---|---|
| 1 | Found | 4×6min | 5×3min | 55mi | |
| 2 | Found | 4×7min | 6×3min | 60mi | |
| 3 | Found | 5×7min | 6×3min | 65mi | |
| 4 | Found | 5×8min | 7×3min | 70mi | |
| 5 | Build | 5×8min | 7×3min | 80mi | |
| 6 | Build | 5×8min | 8×3min | 85mi | **back-to-back** — Sun = 35mi on tired legs, Strength C dropped |
| 7 | Build | 5×8min | 8×3min | 90mi | |
| 8 | Build | 4×8min (deload) | 6×3min (deload) | 100mi | **back-to-back + LOADED gear + full fueling test** — Sun = 45mi, Strength C dropped |
| 9 | Peak | 3×8min | 5×3min | Full 2-day loaded rehearsal | real sleep system + race-pace fueling |
| 10 | Peak | 3×8min | 5×3min | Second loaded 2-day rehearsal | |
| 11 | Taper | 1 short effort @ intensity | 1 short hill effort | 55mi moderate | volume ~−30% |
| 12 | Taper | 1 short effort early wk only | — | short/easy only | volume ~−50–60%; **race Thu Sept 24** |

- Sweet spot @ 90–100% FTP, seated majority, 70–80rpm, full recovery. VO2 @ 106–120% FTP, 3min easy spin recovery. Tempo (Fri) = 40mi @ ~18mph, 75–85% FTP, all weeks (drop/shorten wk12).
- All long rides = **max vertical gain** is the target, not distance.
- **wk8 chosen as the loaded-gear/fueling-test weekend** (bigger 100mi day, closest to Peak, freshest lessons). Both Sat + Sun in wks 6 & 8 carry a `back_to_back` flag; Strength C is dropped those two Sundays.

#### Strength rounds — week by week (deterministic)

| Wk | Phase | A / B rounds | Strength C |
|---|---|---|---|
| 1–2 | Found | 3 | full, 3-round main circuit |
| 3–4 | Found | 4 | full, 4-round main circuit |
| 5–6 | Build | 3 | full (except wk6 Sun dropped for back-to-back) |
| 7–8 | Build | 2 | full (except wk8 Sun dropped for back-to-back) |
| 9–10 | Peak | 2 (A + lighter B) | **dropped** |
| 11–12 | Taper | A = mobility/band-only 15–20min; B dropped | **dropped** |

- **Fueling notes** attached to every ride >90min (60–90g carb/hr, 500–750ml/hr, pre-sleep + wake fueling for 2-day sim). Emphasized on wk8 loaded weekend and Peak rehearsals.

Bike detail view = read the `detail`; no timer. Interval targets show **%FTP as the primary label with computed watts alongside** (e.g. "90–100% FTP · 231–257W"), derived from `settings.ftp_watts` (seed 257). A minimal FTP field lives in settings; updating it recalculates every interval. No full test-logging flow in v1. Strength detail = drives the guided runner.

---

## 8. Guided Strength Runner (the centerpiece)

Modeled on the attached reference: HUD panels over a pixel mountain/race backdrop.

### Circuit definitions (exact)

All work intervals = **40s work / 20s rest**; **60s between rounds**.

**Shared warm-up (all three sessions)** — tap-to-advance, spoken name, no countdown:
banded lateral walks 2×10/side · banded clamshells 2×10/side · band pull-aparts 2×15 · 90/90 hip switch 1 min.

**Strength A (Mon) — Hip focus** — rounds by phase: **3–4** (P1), **2–3** (Build), **2** (Peak), mobility/band-only 15–20 min in Taper. Order:
`kb_swing` → `single_leg_rdl` (switch sides each round) → `hip_hike` → `bird_dog` → `dead_bug` → `side_plank` (alternate sides by round).

**Strength B (Wed) — Posterior chain** — rounds: **3–4** (P1), **2–3** (Build), lighter in Peak, **dropped in Taper**. Order:
`kb_swing` → `goblet_press` → `single_arm_row` → `pushup_row` → `plank_shoulder_tap`.

**Strength C (Sun) — Bigger + ab focus, 40–60 min** — **dropped in Peak & Taper**; skipped on Build back-to-back weekends (wk6, wk8). Main-circuit round count follows the deterministic table in §7 (3 in wk1–2/5–6, 4 in wk3–4). Sequence:
warm-up → `turkish_getup` 3–5/side (**tap**) → main circuit (round count per §7) 40/20 of [`kb_swing`, `goblet_press`, `single_arm_row`, `pushup_row`] → `farmer_carry` 3×40m (**tap**) → ab finisher: `reverse_crunch` 3×12, `russian_twist` 3×16, `plank` 3×45–60s. Gym-access swap (per-session toggle): `hanging_leg_raise` 3×10, `cable_woodchop` 3×12/side.

### HUD elements
- **CURRENT TIME** big countdown (mm:ss).
- **Total Duration** of current interval.
- **Exercise name** (highlighted).
- **SET X OF Y** + **progress ring** (% through the interval).
- **Demo figure** looping the current movement — illustrated/anime-style character in the reference-image aesthetic (subtle 2–3 frame / idle-motion loop). CSS-animated silhouette placeholder in v1, swapped later. NOT a pixel sprite.
- Controls: **Pause**, **End Early**.

### Step types
1. **Warm-up steps** (banded walks, clamshells, pull-aparts, 90/90) — **tap-to-advance**. On open: **speak the exercise name**, then wait for tap. No countdown.
2. **Work interval** — 40s countdown, voice **"Start,"** **"10 seconds left"** at 0:10, **beep each of the final 5 seconds**.
3. **Short rest** — 20s, voice **"Rest,"** 5-second beep countdown before next work step.
4. **Round-break** — 60s between rounds, **full cues + round callout** (voice "Rest," "Round 2 of 4," 5-second beep countdown before resuming).
5. **Tap-to-complete strength** (Turkish get-ups, farmer carries) — **speak name**, wait for tap, no countdown.

### Flow
Breakdown screen → **Tackle this Workout** (unlocks audio) → warm-up taps → circuit rounds (work/rest, round-breaks between) → any Strength-C tap steps + ab finisher → **auto-complete** → celebration.

### Controls behavior
- **Pause** freezes timer + audio; resume continues.
- **End Early** exits the runner and **does NOT mark the session complete** (no free finish line).
- Completing the full flow marks the session complete `via = guided` and fires the peloton.

### Audio spec
- Beep: short Web Audio tone (~50–80ms), distinct final-second pitch optional.
- Voice: SpeechSynthesis; keep phrases short so they finish before the moment passes.
- All audio unlocked on the "Tackle" tap; must not require the music app to pause.

---

## 9. Body Metrics

- Form: **weight (lb)** + **body-fat % (optional)** + date (defaults today).
- **Two-line trend chart** — weight and BF% as separate lines, shared date axis.
- Manual entry only in v1. Structure the entry path so a future import (scale app / Apple Health export) can populate the same table.

---

## 10. Visual Design Direction

Two layers, resolved from the reference image:

- **UI chrome = retro/arcade HUD treatment:** HUD panels with chunky borders, big blocky countdown numerals, warm accent (amber/orange) + cool cyan for timers. Applies to calendar tiles, buttons, headers, HUD frame, progress bar.
- **Characters = illustrated/anime-style** (the figure IN the reference image), NOT pixel sprites: the exercise-demo figure and the peloton riders are illustrated. v1 uses CSS-animated silhouette placeholders with a clean swap boundary; real illustrated assets (one per exercise, mix of riders for the peloton) come as a later art pass.
- **Where readability wins:** exercise cues, fueling notes, interval targets — legible type, never a blocky/pixel font for body copy.
- **Peloton/demo figures:** **mix of riders** (varied looks), illustrated style.
- Consult the `frontend-design` skill during build for typography/token discipline so the retro treatment stays intentional, not templated.

---

## 11. Auth & Sync

- **Email/password** via Supabase Auth.
- RLS on every table so only the owner's rows are readable/writable.
- Realtime (or refetch-on-focus) so completing on the phone shows on the iPad.

---

## 12. Build Order (feed into Cursor in this sequence)

1. **Setup:** create GitHub repo, scaffold Vite+React+Tailwind, init Supabase project, wire env vars, first Vercel deploy (empty app live).
2. **Schema + seed:** create tables + RLS; write a seed script that generates the 84 `plan_days` starting **Mon July 6**, Monday-aligned, with the 4/4/2/2 phase boundaries (§6) and phase-correct `detail` (§7, §8). Seed `settings.ftp_watts = 257`.
3. **Auth:** email/password sign-in, protected routes.
4. **Calendar + completion:** render 84 days, progress bar, manual complete, retroactive complete, missed styling, intra-week move.
5. **Peloton celebration:** the animation + non-repeating winner.
6. **Bike session view:** detail + complete.
7. **Strength breakdown + guided runner:** HUD, step engine, audio, pixel demos, pause/end-early.
8. **Metrics:** entry form + two-line chart.
9. **Polish:** iPad layout pass, PWA/install (optional), pixel-art refinement.

---

## 13. Open Items / Future
- Exercise & animation **authoring UI** (post-v1; schema already supports it).
- **Scale integration** path (Apple Health export import, or manual stays).
- Optional: FTP-test logging, per-ride "felt like" + fueling-hit notes, streaks/badges.

---

## 14. Acceptance Criteria (v1 "done")
- [ ] 84 dated sessions render with correct phase volumes; today highlighted; missed greyed.
- [ ] A day can be moved only within its own week.
- [ ] Any session can be completed manually and retroactively; progress bar reflects `X/84`.
- [ ] Completing fires the pixel peloton; winner never repeats back-to-back; stays consistent on re-view.
- [ ] Bike session shows detail + completes in one tap.
- [ ] Strength runner walks warm-up (tap), runs 40/20 circuits with 60s round-breaks, speaks/beeps per spec, shows HUD (countdown, total, name, SET X/Y, ring, demo).
- [ ] Audio plays over background music without pausing it; unlocked by the Tackle tap.
- [ ] Pause works; End Early exits without completing.
- [ ] Weight + BF% entry saves and renders as a two-line chart.
- [ ] Login syncs the same data across phone and iPad.
