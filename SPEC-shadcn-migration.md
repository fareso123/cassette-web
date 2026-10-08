# Spec: daisyUI → shadcn/ui migration

> Status: implemented on `refactor/shadcn-migration`. Plan: `tasks/plan.md`,
> tasks: `tasks/todo.md`.

## Objective

Replace daisyUI 5 with shadcn/ui as the component and token layer, preserving the
COUNDEX cassette-poster design from `design2.md`. Success = no daisyUI in the
dependency tree or stylesheet, every screen rendered through shadcn primitives,
and no regressions in behaviour or accessibility.

Non-goal: a redesign. The palette was deliberately restored to `design2.md`'s
documented values, which is a visible change; everything else is a 1:1 port.

## Decisions

| Decision | Choice | Why |
| --- | --- | --- |
| Theme strategy | `:root` sage + `.dark` near-black | The two daisyUI themes were both light, so the Sun/Moon toggle was a lie. `design2.md` documents a near-black variant; using it makes the control honest and lets shadcn's `dark:` utilities work. |
| Palette | Restore `design2.md`'s `#98A783` sage | The implementation had drifted to `oklch(0.92 0.03 100)`, roughly the off-white `#ECEFE6`. |
| shadcn base | Base UI (`base`), `nova` style | Chosen over the recommended Radix. Risk was gated: Base UI's `TabsList` ships `enableHomeAndEndKeys: true` and `loopFocus: true`, matching the hand-rolled handler exactly, so the fallback to `--base radix` was not needed. |
| `cn()` location | `src/lib/utils.ts`, `utils/` directory dissolved | A file and a directory sharing a base name is ambiguous for TS resolution. |
| `cn` implementation | The `cn` package, replacing `clsx` + `tailwind-merge` | `github.com/shadcn-ui/cn` is first-party and a documented drop-in. The old deps became orphaned. |

## Ordering constraint

daisyUI's `@theme` and shadcn's `@theme inline` both register `--color-primary`,
`--color-secondary`, `--color-accent`, `--color-neutral` and `--color-ring`. Two
blocks defining the same variable is last-writer-wins with no warning, so the two
libraries cannot coexist even transiently. The token swap and the daisyUI removal
landed in one commit, and component rewiring followed.

## Contrast consequences

The restored palette is mid-tone, so the codebase's habitual alpha-modified text
failed. Measured, not assumed:

| Pair | Ratio | Verdict |
| --- | --- | --- |
| `#1C201C` on `#98A783` | 6.43:1 | AA pass |
| `#1C201C` at 50% over sage (≈ `#5A634F`) | 2.40:1 | **Failed** |
| `#ECEFE6` on `#ED591A` | 3.48:1 | **Failed** |
| `#ECEFE6` on `#141610` | 15.7:1 | Pass |

Both failures were resolved on-brand rather than by abandoning the palette:

- `--muted-foreground` became a **solid** derived colour. `--muted #849c72` sits a
  restrained 1.173 step off the canvas, and `#283020` measures 5.34:1 on sage and
  4.55:1 on muted. Values were found by search, not by hand arithmetic.
- `--primary-foreground` flipped from white to near-black `#1c201c` (4.75:1 on the
  orange primary). Black-on-orange suits the brutalist system better anyway.

`src/__tests__/tokens-contrast.test.ts` parses the real CSS and fails any declared
pair under 4.5:1 in either theme, so the next palette tweak cannot regress silently.

## Defects fixed along the way

Each was found by reading or observing the running app, not introduced by the
migration except where noted.

| Defect | Cause |
| --- | --- |
| `spin-slow` never rotated | The class had no `@keyframes` anywhere; the reduced-motion override guarded nothing |
| Hydration failure on every load | `Intl.DateTimeFormat(undefined, …)` resolved to the server locale on SSR and the browser locale on the client, so timestamps rendered differently |
| Theme could not switch back to light | The controller wrote `document.documentElement.classList` imperatively and lost to the `className` prop React renders for the same node. Fixed by rendering `<html>` from `RootDocument` so React owns the class. |
| URL mode silently blocked submit | `type="url"` triggered native constraint validation, showing the browser's bubble instead of the app's `role="alert"` region |
| Font stack silently droppable | shadcn's `init` generated `--font-sans: var(--font-sans)` inside `@theme inline`, a self-reference |
| Base UI warning on the download link | `Button` defaults `nativeButton` to `true`; the link is deliberately an anchor, so it needs `nativeButton={false}` |
| Grain stacked four layers deep | `paper-grain` sat on `body`, the page wrapper, `Navbar` and `Footer` |
| Duplicated giant background letter | The page-wide `CX` and the hero `C` did the same job; `design2.md` documents one |

## Component substitutions

| Before | After |
| --- | --- |
| `role="group"` + `aria-pressed` mode switch | `ToggleGroup` — one tab stop with arrow keys |
| 40-line hand-rolled tablist, roving tabindex, `onKeyDown` | `Tabs` — that logic deleted, not reimplemented |
| `<p role="alert">` error | `Alert` with the live region preserved |
| `NO RESULTS FOUND` block | `Empty` |
| Search field with icon and inline submit | `InputGroup` + `InputGroupAddon` + `InputGroupButton` |
| `Loader2` + manual spin | `Spinner` with `data-icon` |
| Result card `<div>` shell | `Card` with `Header` / `Content` / `Footer` |
| `btn-ghost btn-circle btn-sm` | `Button variant="ghost" size="icon-sm"` |
| Bare `Searching…` text while loading | `Skeleton` grid matching the real two-column grid |

The download link stays an `<a>` rendered through Base UI's `render` prop: a
`<button>` would break middle-click, copy-link and the status-bar preview.

## Preserved deliberately

- `ResultsTabs.toCard()` / `resultKey()` — they normalize two result shapes that
  share no URL field. That was a real bug fix.
- `ResultCard`'s plain `<img>` and its comment: `next/image` would need an
  open-ended `remotePatterns` list, turning the image optimizer into a fetch
  proxy for arbitrary third-party URLs.
- The footer's inline gradient style, per the project convention for
  `var(--font-*)`-style bindings. It now interpolates live tokens.

## Verification

| Check | Result |
| --- | --- |
| `npm test` | 68 pass, 0 fail |
| `npx tsc --noEmit` | clean |
| `npm run lint` | 0 errors, 0 warnings |
| `npm run build` | clean, `/` prerenders |
| `git grep -I daisyui` | no hits outside lockfile history |
| Theme toggle, both directions | verified via computed styles (`#141610`/`#ECEFE6` dark, `#98A783`/`#1C201C` light) |
| Result cards | verified by DOM snapshot: 4 cards, durations `7:09` and `62:05`, 3 download links, 1 "No download available" |

The visual screenshot tool served stale compositor frames throughout, so theme
verification used `browser.inspect` computed styles as the source of truth instead.

## Out of scope, still open

- No component test infrastructure. `bun test` covers `src/lib`, the API route and
  the two static gates, but nothing renders a component. React Testing Library is
  still outstanding.
- Scraper selectors remain unverified.
- No database or yt-dlp binary is available locally, so the real search path
  cannot be exercised; the temporary fixture route used for card verification has
  been deleted.
