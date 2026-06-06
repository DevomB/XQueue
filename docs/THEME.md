# PostWave — Website Theme & Design System

The single source of truth for the marketing site's look, voice, and intent.
Read this before touching any marketing page so the site stays coherent.

## 1. Positioning (the one-liner)

**Mission control for your X presence.**
PostWave is the calm, operator-grade scheduler for people who post on X seriously —
indie founders, creators, and small teams. You batch your posts once, set the
times, and close the laptop. The cloud worker publishes on schedule through the
**official X API** — no browser tab, no DOM hacks, no risk to your account.

The website's only job: make a serious poster trust us in ~10 seconds and feel
that the product is precise, safe, and clearly worth $15/mo.

## 2. Theme name & mood

**"Signal in the dark."**

- A near-black control room. Quiet, focused, expensive-feeling.
- One electric **signal blue → cyan** beam is the brand. It's the "post going out."
- A second **emerald** tone means "on time / published ✓" — used sparingly as proof of reliability.
- Monospace appears only for *data* moments (timestamps, schedules, the bulk-paste
  format). That contrast reinforces "automation you can trust."

If a design choice doesn't feel calm, precise, and trustworthy, it's wrong.

## 3. Color tokens

| Token            | Value      | Use |
|------------------|------------|-----|
| `--background`   | `#030303`  | Page canvas |
| `--card`         | `#0a0a0a`  | Cards, panels |
| `--border`       | `#27272a`  | Hairlines (zinc-800) |
| `--foreground`   | `#fafafa`  | Primary text |
| `--muted`        | `#a1a1aa`  | Body text (zinc-400) |
| Signal blue      | `sky-400/500` `#38bdf8` | Primary accent, CTAs, the "beam" |
| Signal cyan      | `cyan-300` | Gradient tail of the beam |
| Success          | `emerald-400` | "Published ✓", reliability proof — sparing |
| Danger           | `red-500`  | Errors only |

Backgrounds step in three depths: `#030303` (page) → `#0a0a0a` (card) →
`zinc-900` (raised). Never more than one glowing accent element per viewport.

## 4. Type & spacing

Three faces, each with one job. Don't introduce a fourth.

- **Display — Space Grotesk** (`font-display`, weight 500–700): headlines, the
  wordmark, big stat numbers, and price figures only. Engineered and a touch
  distinct so the brand has a recognizable voice. Always `tracking-tight`.
- **Sans — Geist Sans** (`font-sans`, the default): all body copy, UI, labels,
  buttons, nav. The workhorse.
- **Mono — Geist Mono** (`font-mono`): *data* moments only — timestamps,
  schedules, the bulk-paste preview. The contrast is what signals "automation
  you can trust." Never use mono for prose.

Apply display via the `.font-display` utility (wired to `--font-display` in
`globals.css`), never by hardcoding the font name.

- Hero headline: `font-display`, `text-5xl`→`text-7xl`, `font-semibold`,
  `tracking-tight`, `leading-[1.05]`. The second line is the gradient beam.
- Section headings: `font-display`, `text-3xl`→`text-4xl`, `font-semibold`,
  eyebrow label above in `uppercase tracking-widest text-sky-400 text-xs`.
  (Use the shared `SectionHeading` component — it already does this.)
- Body: `text-zinc-400`, `leading-relaxed`, max width ~`max-w-2xl`.
- Rhythm: sections `py-20`→`py-28`; content `max-w-6xl px-4`.
- Radius: cards `rounded-2xl`, pills/buttons `rounded-xl`/`rounded-full`.

## 4a. Logo & wordmark

- One source of truth: the `BrandLogo` component (`components/layout/brand-logo.tsx`).
  Use it in the header, footer, and anywhere the brand appears. Never re-hand-roll
  the "PW" badge.
- The mark reads as a *queue* (stacked rows) with one signal-blue *beam* leaving
  the stack — the post going out on schedule. Wordmark is `font-display`.

## 5. Signature visual elements

- **Grid + glow orb** behind the hero (`.grid-bg`, `.glow-orb`). One per page, top.
- **Beam gradient** text: `from-sky-400 to-cyan-300 bg-clip-text`.
- **Status pills:** `Scheduled` (sky) → `Published ✓` (emerald). The product's heartbeat.
- **Glass cards:** `border border-zinc-800 bg-zinc-900/50 backdrop-blur`.
- **Bento feature grid:** uneven tiles, one hero tile with the product mock.
- **Logo marquee + stat counters:** quiet social proof, never loud.
- Motion is subtle: fade/translate on scroll, slow marquee, soft hover lifts.
  No bouncing, no confetti, no parallax circus.

## 6. Voice

Confident, concise, builder-to-builder. Sell the outcome (time back, never miss
a window, sleep through your 2 AM slot), not the feature list. No hype words
("revolutionary", "AI-powered", "10x"). Short sentences. A little dry wit is fine
("Close your laptop. We've got the 2 AM slot.").

## 7. Social proof policy

The product is new, so testimonials and stats are **illustrative**. Rules:
- Personas must be realistic (indie founders, creators, agencies), with varied
  voices and believable, modest numbers — not "I made $1M".
- Never invent named real companies, real people, or fake press logos that imply
  endorsement. Logos in the marquee are generic *categories* of user
  ("Indie founders", "Newsletter writers", "Dev tool teams"), not brands we can't claim.
- Stats describe the product's mechanics ("publishes within ±30s of schedule"),
  not unverifiable traction we don't have.
- Keep it tasteful enough that it survives the day we replace it with real proof.

## 8. Trust surface (must always be answerable on the site)

- Uses the **official X API** + OAuth — not browser automation, won't get you banned.
- We **encrypt your tokens** and never store your X password.
- **Failure alerts + one-click retry** — you're never silently dropped.
- **Cancel anytime**, transparent link-post pricing, no lock-in.
These live in the hero subtext, a security strip, and the FAQ.

## 9. Moat — what the site never reveals

We sell the *outcome* and the *trust*, never the recipe. The public site must let
a serious poster trust us without teaching a competitor (or an attacker) how to
rebuild us. Hold this line on every page.

**Always say (trust surface — required):**
- We publish through the **official X API** with **OAuth** — not browser
  automation, so your account stays safe.
- Tokens are **encrypted at rest**; we never store your X password.
- **Failure alerts + one-click retry**; **cancel anytime**, transparent pricing.

**Never say (mechanism / moat — keep off the public site):**
- The specific internal architecture or wording that frames us as "just a cron
  job" — e.g. "a cloud worker fires each post," "we store everything in UTC."
  Say "PostWave publishes at the scheduled time" and let the engine be a black box.
- Concrete stack/vendor names (database engine, queue, hosting provider),
  exact algorithm names + parameters, or **any environment-variable / secret
  names**. Legal pages use plain-language equivalents ("industry-standard
  authenticated encryption," "salted password hashing").
- The full bulk-paste *spec*. A short teaser preview is fine as a feature demo;
  a copy-pasteable, exhaustive format reference is not.

Internal docs (`/docs`, README, deployment) can be specific. The marketing site,
legal pages, and security page cannot.

## 10. Don't

- No stock-photo people, no emoji soup, no rainbow gradients, no marketing clichés.
- No more than one accent glow per screen.
- No claims we can't defend. No dark patterns in pricing.
