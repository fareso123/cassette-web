# Tasks: daisyUI → shadcn/ui migration

Plan: `tasks/plan.md` · Spec: `SPEC-shadcn-migration.md`

## Findings recorded during Task 2 (baseline capture)

- **Pre-existing hydration failure.** The console shows `Hydration failed because the
  server rendered HTML didn't match the client` on first load. Cause is
  `page.tsx:19` — `new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' })`.
  An undefined locale resolves to the *server's* locale on SSR and the *browser's*
  locale on the client, so any recent-search timestamp renders differently. React's own
  error message cites "date formatting in a user's locale" as a cause. Fix belongs in
  Task 13, which rewrites those rows anyway: pin an explicit locale and `timeZone: 'UTC'`
  so the output is deterministic.
- **No reachable database.** `npm run db:seed` fails with `ECONNREFUSED`, so the
  `scrapers` table is empty and `/api/search` returns `resultCount: 0` for song
  searches. The result cards cannot be exercised through the real path. A temporary
  fixture route `src/app/previewfixture/page.tsx` mounts `ResultsTabs` with fixed data
  to give a before/after comparison. **Delete it before the branch merges.**
- **`curl.exe` needs `--noproxy "*"`.** `Invoke-RestMethod` gets a 502 from a system
  proxy on POST; curl reaches the route fine. Not a code issue.
- **Both current themes are light.** The baseline screenshot confirms a cream canvas
  (`oklch(0.92 0.03 100)`), not the sage `#98A783` the design doc specifies, and the
  Moon icon shows while the page stays light.

---

## Task 1: Dissolve `src/lib/utils/`, add `cn()`

**Description:** shadcn expects `cn()` at `src/lib/utils.ts`, but `src/lib/utils/` is a
directory holding `youtube.ts`. A file and a directory sharing a base name is ambiguous
for TS resolution. Move the youtube module up one level and create the conventional
shadcn util.

**Acceptance criteria:**
- [x] `src/lib/utils.ts` exports `cn()` composed from `clsx` + `tailwind-merge`
- [x] `src/lib/youtube.ts` exists; `src/lib/utils/` no longer exists
- [x] Both importers use the `@/lib/` alias (the route's relative `../../../` path is
      replaced with `@/lib/youtube`)

**Verification:**
- [x] `npx tsc --noEmit` clean
- [x] `bun test src/__tests__/youtube-utils.test.ts` passes — 7 pass, 0 fail

**Dependencies:** None

**Files:** `src/lib/utils.ts`, `src/lib/youtube.ts`, `src/app/api/search/route.ts`,
`src/__tests__/youtube-utils.test.ts`

**Estimated scope:** S

---

## Task 2: Capture baseline screenshots

**Description:** The approval criteria name three expected visual deltas (sage
background, dark theme, skeletons). Everything else must be provably unchanged, which
requires a before-image to diff against.

**Acceptance criteria:**
- [x] Main page captured at 1440px and 390px
- [x] Both current themes captured at 1440px
- [x] Result cards captured via the fixture route (DOM baseline: 4 cards, durations
      7:09 and 62:05, three download links, one "no download available" case)
- [x] Stored in `.openchamber/screenshots/` with a `before-` prefix

**Verification:**
- [x] Each image is readable and shows the expected theme
- [x] Baseline confirms the cream-canvas drift and the hydration error

**Dependencies:** None

**Estimated scope:** XS

---

## Task 3: shadcn `init` (Base UI, nova preset)

**Description:** Generate `components.json`, install `class-variance-authority` and the
Base UI primitives, and scaffold the token block. Must run *before* Task 4 because
`init` rewrites `globals.css`.

**Acceptance criteria:**
- [ ] `components.json` exists with `base: "base"`, `style: "nova"`,
      `aliases.utils: "@/lib/utils"`
- [ ] `cva` and the Base UI package are in `package.json`

**Verification:**
- [ ] `npm run build` succeeds
- [ ] `npx shadcn@latest info` reports the expected base and style

**Dependencies:** Task 1

**Estimated scope:** XS

---

## Task 4: Atomic token swap — remove daisyUI, author the token block

**Description:** The highest-risk task. Replace the three daisyUI plugin blocks with
shadcn's `@theme inline` contract for both themes, fix the font variable collision, add
the missing `spin-slow` keyframes, delete dead utilities, relocate press feedback, and
gate hover behind a pointer-type media query.

**Acceptance criteria:**
- [ ] No `@plugin "daisyui"` remains; `daisyui` gone from `package.json`
- [ ] `:root` carries the sage tokens, `.dark` the near-black tokens
- [ ] `--muted-foreground` is a solid color in both themes, never `foreground/50`
- [ ] `primary-foreground` is near-black, not white
- [ ] Font vars renamed to `--font-inter` / `--font-russo-one` / `--font-space-mono`
- [ ] `@keyframes spin-slow` exists; `prefers-reduced-motion` still stops it
- [ ] `.paper-grain`, `.tech-divider`, `.playback-arrows` survive
- [ ] `.font-mono-display`, `.font-condensed-display`, `@utility btn`, and the unused
      `--ease-in-out` / `--ease-drawer` tokens are deleted
- [ ] `@media (hover: hover) and (pointer: fine)` guards hover transforms

**Verification:**
- [ ] `npm run build` clean
- [ ] `git grep -I daisyui` returns nothing outside lockfile history
- [ ] `bun test src/__tests__/tokens-contrast.test.ts` passes

**Dependencies:** Task 3

**Estimated scope:** M

---

## Task 5: Add the 12 shadcn components

**Description:** `button input input-group toggle-group tabs card badge empty skeleton
spinner alert separator`

**Acceptance criteria:**
- [ ] All 12 files present under `src/components/ui/`
- [ ] `Spinner` imported where the old `Loader2` was used
- [ ] Every added file reviewed for missing sub-components and hardcoded import paths

**Verification:**
- [ ] `npm run build` clean

**Dependencies:** Task 4

**Estimated scope:** S

---

## Task 6: Keyboard-verify Base UI `Tabs` + `ToggleGroup`

**Description:** Gate before any rewiring. Base UI is younger than Radix; if its
roving-focus behaviour differs from the hand-rolled handler in `ResultsTabs`, fall back
to `--base radix` now while it is still a one-flag change.

**Acceptance criteria:**
- [ ] Arrow keys, Home, End, and Tab all behave as expected in `Tabs`
- [ ] `ToggleGroup` moves as a single tab stop
- [ ] Decision recorded in the commit message

**Verification:**
- [ ] Manual keyboard pass in the browser

**Dependencies:** Task 5

**Estimated scope:** XS

---

## Task 7: Rewire `ThemeController`

**Description:** Smallest blast radius. `btn-ghost btn-circle btn-sm` → shadcn `Button`,
and switch `data-theme` to the `.dark` class.

**Acceptance criteria:**
- [ ] Uses shadcn `Button` with `variant="ghost"`
- [ ] Toggles `.dark` on `<html>`; `useSyncExternalStore` hydration contract preserved
- [ ] Zero `btn-*` classes remain

**Verification:**
- [ ] `npm run lint` and `npm run build` clean
- [ ] Toggle round-trips and survives reload

**Dependencies:** Task 6

**Estimated scope:** XS

---

## Task 8: Rewire `SearchBar`

**Description:** The mode switch becomes `ToggleGroup`; the search field becomes
`InputGroup` with an icon addon and an inline submit addon; the submit button becomes
shadcn `Button` + `Spinner`. Also drops `type="url"`, which currently blocks submit via
native constraint validation and shows a browser bubble instead of the app's error
surface.

**Acceptance criteria:**
- [ ] `ToggleGroup` replaces the `role="group"` + `aria-pressed` pair
- [ ] `InputGroup` + `InputGroupInput` + `InputGroupAddon` compose the field
- [ ] `type="search"` always, `inputMode` varies by mode
- [ ] Loading state uses `Spinner` with `data-icon`
- [ ] No manual template-literal ternaries — `cn()` only

**Verification:**
- [ ] `npm run lint` and `npm run build` clean
- [ ] Submit works in both modes; invalid URL surfaces through the app's error region

**Dependencies:** Task 7

**Estimated scope:** S

---

## Task 9: Rewire `ResultsTabs`

**Description:** Replace the 40-line hand-rolled tablist, roving tabindex, and
`onKeyDown` handler with shadcn `Tabs`. The `toCard()` / `resultKey()` normalization
must survive intact — it exists to fix a real bug.

**Acceptance criteria:**
- [ ] `Tabs` / `TabsList` / `TabsTrigger` / `TabsContent` used
- [ ] No `role="tablist"` markup remains
- [ ] `toCard()` and `resultKey()` unchanged
- [ ] Empty state uses `Empty`; tab counts use `Badge`

**Verification:**
- [ ] `npm run lint` and `npm run build` clean
- [ ] Keyboard traversal verified against Task 6 baseline

**Dependencies:** Task 8

**Estimated scope:** S

---

## Task 10: Rewire `ResultCard`

**Description:** Card shell → shadcn `Card`; the download `<a>` gets shadcn `Button`
semantics *and* the press feedback that `@utility btn` used to supply. Keeps the plain
`<img>` with its documented rationale.

**Acceptance criteria:**
- [ ] Full `CardHeader` / `CardContent` / `CardFooter` composition
- [ ] Press feedback present (`active:scale-[0.97]`)
- [ ] Duration overlay stays legible on the sage canvas
- [ ] `<img>` and its explanatory comment preserved verbatim
- [ ] "No download available" remains visible text, not a disabled control

**Verification:**
- [ ] `npm run lint` and `npm run build` clean

**Dependencies:** Task 9

**Estimated scope:** S

---

## Task 11: Rewire `HeroSection`

**Description:** Source chips → `Badge`. Replace the inline `var(--c-text)` style with
token-driven classes and repair the rotating `Disc`.

**Acceptance criteria:**
- [ ] `Badge` for the three source chips
- [ ] No inline `color:` / `fontFamily:` style objects — tokens only
- [ ] `spin-slow` actually rotates and stops under reduced motion

**Verification:**
- [ ] `npm run lint` and `npm run build` clean
- [ ] Disc rotates; static under `prefers-reduced-motion`

**Dependencies:** Task 10

**Estimated scope:** S

---

## Task 12: Rewire `Navbar` + `Footer`

**Description:** Token remap across the remaining `base-*` and `neutral-*` sites. The
footer gradient and `tech-divider` survive as bespoke classes; `grain` is dropped from
nested elements so it no longer stacks four layers deep.

**Acceptance criteria:**
- [ ] Zero daisyUI color tokens in either file
- [ ] `paper-grain` applied to `body` only
- [ ] `tech-divider` and `playback-arrows` still render
- [ ] Footer gradient sourced from tokens, not `--c-*` aliases

**Verification:**
- [ ] `npm run lint` and `npm run build` clean

**Dependencies:** Task 11

**Estimated scope:** S

---

## Task 13: Rewire `page.tsx`

**Description:** Error paragraph → `Alert`. Add the `Skeleton` results grid so loading
shows structure instead of a bare "Searching…" string. Recent-searches rows get
consistent focus and hover treatment.

**Acceptance criteria:**
- [ ] `Alert` with a live region for errors
- [ ] `Skeleton` cards render while `loading`
- [ ] `role="status"` announcement preserved
- [ ] Zero daisyUI color tokens

**Verification:**
- [ ] `npm run lint` and `npm run build` clean
- [ ] Error and loading states both reachable

**Dependencies:** Task 12

**Estimated scope:** S

---

## Task 14: Rewire `layout.tsx`

**Description:** Rename the next/font variables per the collision fix, remap the skip
link tokens, and remove the duplicated grain layer.

**Acceptance criteria:**
- [ ] Font variables renamed to `--font-inter` / `--font-russo-one` / `--font-space-mono`
- [ ] Skip link uses `bg-background` / `text-foreground` / `border-border`
- [ ] No inline `fontFamily` style binding
- [ ] No `data-theme` attribute introduced

**Verification:**
- [ ] `npm run lint` and `npm run build` clean
- [ ] No hydration warning in the console

**Dependencies:** Task 13

**Estimated scope:** S

---

## Task 15: Add regression tests

**Description:** Two static gates. `no-daisyui` asserts the dependency and classes are
gone; `tokens-contrast` parses `globals.css` and fails any foreground/background pair
under 4.5:1.

**Acceptance criteria:**
- [ ] `no-daisyui` fails if `daisyui` reappears in `package.json` or `globals.css`
- [ ] `no-daisyui` fails on any daisyUI class token in `src/app` or `src/components`
- [ ] `tokens-contrast` covers every pair in both themes
- [ ] Both pass

**Verification:**
- [ ] `npm test` green
- [ ] Each test verified to fail when its condition is violated

**Dependencies:** Task 14

**Estimated scope:** M

---

## Task 16: Update documentation

**Description:** `AGENTS.md` documents daisyUI, the two themes, `ThemeController`, and
styling conventions — all now wrong. `PROJECT_SETUP.md:119` names the daisyUI plugin.

**Acceptance criteria:**
- [ ] `AGENTS.md` describes shadcn, the token model, `src/components/ui`, and the
      `utils.ts` convention
- [ ] `PROJECT_SETUP.md:119` corrected
- [ ] Known Gaps section still accurate

**Verification:**
- [ ] `git grep -I daisyui` returns nothing in `*.md`

**Dependencies:** Task 15

**Estimated scope:** S

---

## Task 17: Verification pass

**Description:** Compare against the Task 2 baseline and confirm only the three approved
deltas appear.

**Acceptance criteria:**
- [ ] Screenshot deltas limited to sage background, dark theme, skeletons
- [ ] `npm run lint`, `npm run build`, `npm test` all clean
- [ ] Every token pair ≥ 4.5:1 in both themes
- [ ] Keyboard traversal verified end to end
- [ ] `prefers-reduced-motion` verified
- [ ] Working tree clean apart from the pre-existing `.env` modifications

**Verification:**
- [ ] Full checklist above

**Dependencies:** Task 16

**Estimated scope:** M
