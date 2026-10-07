# Cassette Web — Design System (v2)

> Extracted from 3 reference screenshots via vision + pixel measurement.
> **COUNDEX** cassette-player poster, Y2K/brutalist industrial voice.
> Colors: vision-model hex codes + sharp k-means cross-reference.
> Typography: vision-model read; font names inferred where possible.

---

## 1. Voice & Mood

Industrial, technical, Y2K-brutalist. Monospaced metadata everywhere. Heavy condensed display type. High contrast, no softness. Think equipment manual meets streetwear poster.

---

## 2. Color Palette

### Primary Backgrounds (3 variants across screenshots)

| Variant | Hex | Source |
|---|---|---|
| Sage / Olive (images 1, 2) | `#98A783` / `#9EA278` / `#9FA878` | Vision + k-means |
| Orange (image 3) | `#E4511C` / `#F05007` / `#ED4E05` | Vision + k-means |
| Lime Neon (cassette only) | `#86BD16`–`#A2D920` / `#B6E24D` | Vision + k-means |

### Secondary / Functional

| Role | Hex | Usage |
|---|---|---|
| Text & Linework | `#1C201C`–`#23271A` | All typography, rules, arrows, giant bg text |
| Near-Black (dark variant) | `#211D1B`–`#141610` | Footer boxes, inverted elements |
| Accent CTA (orange) | `#ED591A`–`#F15C1E` / `#FF4F00` / `#F4501E` | Bottom "BUY NOW" tab |
| Highlight / Off-White | `#ECEFE6`–`#DFE3D8` / `#F2F2F2` | Logo fill, plastic reflections, labels |
| Silver (label) | `#D5D9D4` | Cassette sticker background |

### CSS Tokens

```css
:root {
  --c-bg-green:   #98A783;   /* sage / olive canvas */
  --c-bg-orange:  #E4511C;   /* vibrant orange canvas */
  --c-text:       #1C201C;   /* near-black, all text & linework */
  --c-cta:        #ED591A;   /* bright orange CTA */
  --c-highlight:  #ECEFE6;   /* off-white accents */
  --c-neon:       #86BD16;   /* lime cassette glow */
  --c-label:      #D5D9D4;   /* silver-gray metadata */
  --c-dark-box:   #141610;   /* black footer badge */
}
```

---

## 3. Typography

| Text Block | Exact Content | Style | Weight | Size |
|---|---|---|---|---|
| Header | `MUSIC PLAYER` / `HF-S 800` | Clean geometric sans-serif, all-caps | Medium | Small |
| Header | `• RECORD START` | Standard sans-serif, all-caps | Medium | Medium-small |
| Logo | `COUNDEX` | Stylized custom display/techno, geometric with orbital rings | Bold, large | Large |
| Subheader | `LIGHT, STYLISH, COMFORTABLE` | Minimalist sans-serif, widely tracked | Light–medium | Extra-small |
| Top-right | `TYPE 1 NORMAL POSITION` | Geometric sans-serif, all-caps | Medium | Small |
| Top-right | `BUY NOW` | Simple sans-serif, all-caps | Medium | Small |
| Giant BG | `W` / `BUY NOW` (image 3) | Ultra-tall, ultra-condensed brutalist display sans-serif | Extra-bold | Massive |
| Diagram labels | `THE UPPER LID` / `POWER AND PROCESSOR` / `THE LOWER PART OF THE BODY` | Standard sans-serif, all-caps, technical drafting | Medium | Small |
| Cassette label | `ZA3NO` / `SAN FRANCISCO` / `CA - USA` / `EXP 14/12/2130` / `REC 0X541` / `ZA3NO.COM` | Technical monospace sans-serif, grid-aligned | Medium–thin | Tiny |
| Cassette banner | `DIRECTIONS!!!` / `REALLY BUSY, NEED SPACE` | Stencil-like sans-serif, retro-futuristic | Bold | Medium |
| Footer badge | `XX1` / `XXL` | Bold blocky sans-serif or slightly stylized monospace | Bold | Medium |
| Footer meta | `NDFR - 00 NMB 00001  2025  TEL N. 800 003 0000` | Condensed sans-serif with terminal/monospace feel | Medium | Very small |
| Footer meta | `IDENTIFICATION NUMBER - 06746HDFGFS634523 64` | Monospace-style, tabular | Medium | Very small |
| Footer button | `---BUY NOW---` | Bold geometric sans-serif, all-caps | Bold | Medium-large |
| Footer serial | `000000003214` / `00000003214` | Numeric monospace sans-serif | Regular | Small |

### Font Guesses

| Block | Likely Font | Fallback |
|---|---|---|
| `COUNDEX` logo | Custom display — similar to **Eurostile Extended**, **Orbitron**, or **Russo One** | `impact`, sans-serif |
| Giant BG text | **Druk Wide**, **Monument Extended**, or **Helvetica Condensed Black** | `arial black`, `impact` |
| Metadata / serials | **SF Mono**, **Courier New**, **IBM Plex Mono** | `monospace` |
| Header labels | **Helvetica Neue**, **Arial**, **Inter** | `system-ui`, `sans-serif` |
| Diagram pointers | **Roboto**, **Open Sans**, **Source Sans Pro** | `sans-serif` |

### CSS Tokens

```css
:root {
  --font-display:   'Eurostile', 'Russo One', 'Arial Black', sans-serif;  /* logo, giant bg */
  --font-condensed: 'Helvetica Condensed', 'Arial Narrow', sans-serif;    /* subtitle */
  --font-mono:      'SF Mono', 'Courier New', 'IBM Plex Mono', monospace; /* metadata, IDs */
  --font-sans:      'Helvetica Neue', 'Inter', 'Arial', sans-serif;        /* body labels */
  --font-tech:      'Roboto', 'Open Sans', 'Source Sans Pro', sans-serif;  /* diagram pointers */
}
```

---

## 4. Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  MUSIC PLAYER      ● RECORD START    LOUNDEX    BUY NOW │  ← Top nav bar
│  HF-S 800                         TYPE 1 NORMAL POS    │
├─────────────────────────────────────────────────────────┤
│   ◄◄ ───────── LIGHT, STYLISH, COMFORTABLE ───────── ►►│  ← Divider line
│                                                         │
│                    [HERO IMAGE / GIANT TEXT]            │  ← Center stage
│                                                         │
├─────────────────────────────────────────────────────────┤
│  ██ NDFR - 00 NMB 00001 ... TEL N. 800 ...              │  ← Footer bar
│     IDENTIFICATION NUMBER - 06746...                    │
│              [----BUY NOW----]    000000003214          │
└─────────────────────────────────────────────────────────┘
```

- Framed poster: top nav → decorative divider → centered hero → bottom footer with metadata + orange trapezoidal CTA.
- Thin technical linework, playback arrow clusters (`◄◄ ►►`), registration marks, pointer lines with circular endpoints.

---

## 5. Motion Guidelines (per Emil Kowalski)

This is a **static poster** — no interactive UI. If porting to a live site:

| Element | Behavior |
|---|---|
| `BUY NOW` CTA | `transform: scale(0.97)` on `:active`, 160ms `ease-out` |
| Giant background text | Decorative only — animate on first visit only |
| Popovers/dropdowns | Enter from trigger origin, 200ms `ease-out`, start at `scale(0.95)` |
| Keyboard actions | No animation |
| `prefers-reduced-motion` | Strip all transform motion, keep opacity |

```css
/* Easing curves */
--ease-out:    cubic-bezier(0.23, 1, 0.32, 1);
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
```

---

## 6. Open Questions / Caveats

- Font *names* are best-effort guesses based on visual style — verify against original Figma/Sketch file if exact typefaces matter.
- Colors are vision-model hex codes with ±3 tolerance; k-means cross-reference agrees within range.
- Image 3 orange variant and images 1/2 green variant are the same layout in different colorways.
- `COUNDEX` is likely a custom logotype — nearest open font matches listed above.
