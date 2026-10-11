# Implementation Plan: daisyUI → shadcn/ui migration

## Overview

Replace daisyUI 5 with shadcn/ui as the component and token layer in cassette-web,
preserving the COUNDEX cassette-poster design from `design2.md`. daisyUI supplies only
three button classes and a color namespace; everything else is already hand-written
Tailwind. The work is therefore a token remap (~120 call sites) plus a component
substitution pass, not a rewrite.

Full specification: `SPEC-shadcn-migration.md`.

## Architecture Decisions

- **Token swap and daisyUI removal are one atomic commit.** daisyUI's `@theme` and
  shadcn's `@theme inline` both register `--color-primary`, `--color-secondary`,
  `--color-accent`, `--color-neutral`, and `--color-ring`. Two blocks defining the same
  variable is last-writer-wins with no warning. No working state exists where both are
  installed, so they cannot be separated.
- **`cn()` lives at `src/lib/utils.ts`.** `src/lib/utils/` is currently a directory
  holding `youtube.ts`; a file and a directory with the same base name is ambiguous for
  TypeScript resolution. The directory is dissolved: `youtube.ts` moves to
  `src/lib/youtube.ts`.
- **next/font variables get renamed.** `next/font` sets `--font-sans` on `<html>` and
  `globals.css` `:root` also sets `--font-sans`. It resolves today only because
  next/font's injected `<style>` outranks the stylesheet. Under shadcn's `@theme inline`,
  `--font-sans: var(--font-sans)` is a self-reference that silently kills the stack. The
  next/font variables become `--font-inter`, `--font-russo-one`, `--font-space-mono` and
  are mapped into shadcn's `--font-sans` / `--font-display` / `--font-mono`.
- **`--muted-foreground` is a solid derived color, not `foreground/50`.** Against the
  restored sage canvas `#98A783`, `#1C201C` at 50% opacity composites to `#5A634F` at
  2.40:1 — fails WCAG AA. A solid `#343830` measures 4.66:1.
- **`primary-foreground` is near-black, not white.** `#1C201C` on `#ED591A` is 4.75:1;
  white on the same orange is 3.48:1 and fails AA. Black-on-orange is also more on-brand
  than white-on-orange for a brutalist system.
- **Base UI is verified before anything is rewired.** `render` replaces Radix's
  `asChild`. The hand-rolled 40-line tablist keyboard handler in `ResultsTabs` must be
  genuinely replaced by `Tabs`, not approximated. Fallback to `--base radix` is a
  one-flag change — cheap before the rewiring commits, expensive after.
- **No component test infrastructure is introduced.** `bun test` covers `src/lib` and
  the API route. The permanent gates are a static token-contrast test, a static
  no-daisyUI test, `npm run build`, and a screenshot diff. Adding React Testing Library
  to a migration is scope creep.

## Task List

### Phase 1: Foundation

- [x] Task 1: Dissolve `src/lib/utils/`, add `cn()`
- [x] Task 2: Capture baseline screenshots
- [x] Task 3: shadcn `init` (Base UI, nova preset)
- [x] Task 4: Atomic token swap — remove daisyUI, author the two-theme token block

### Checkpoint: Foundation

- [x] `npm run build` clean, contrast test green, `git grep -I daisyui` empty

### Phase 2: Components

- [x] Task 5: Add the 12 shadcn components
- [x] Task 6: Keyboard-verify Base UI `Tabs` + `ToggleGroup`
- [x] Task 7: Rewire `ThemeController`
- [x] Task 8: Rewire `SearchBar`
- [x] Task 9: Rewire `ResultsTabs`
- [x] Task 10: Rewire `ResultCard`
- [x] Task 11: Rewire `HeroSection`
- [x] Task 12: Rewire `Navbar` + `Footer`

### Checkpoint: Components

- [x] Each file committed separately, lint + build green after each

### Phase 3: Shell + verification

- [x] Task 13: Rewire `page.tsx` (Alert, Skeleton, recent searches)
- [x] Task 14: Rewire `layout.tsx` (font vars, skip link, grain)
- [x] Task 15: Add `no-daisyui` and `tokens-contrast` tests
- [x] Task 16: Update `AGENTS.md` and `PROJECT_SETUP.md`
- [x] Task 17: Verification pass — screenshots, reduced motion, keyboard

### Checkpoint: Complete

- [x] All acceptance criteria met, ready for review

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Base UI `Tabs` roving focus regresses vs. hand-rolled handler | High | Verify in Task 6 before any rewiring; fall back to `--base radix` |
| Restored sage canvas lowers contrast across 44 `foreground` sites | High | `tokens-contrast` test fails the build; muted becomes a solid token |
| shadcn `init` rewrites `globals.css` | Med | Run `init` *before* authoring the token block, never after |
| `spin-slow` keyframe addition changes first-paint | Low | `prefers-reduced-motion` override retained and tested |
| Screenshot deltas exceed the approved set | Med | Compare against Task 2 baseline; only sage, dark theme, skeletons expected |

## Open Questions

None. All four design decisions were resolved before implementation.
