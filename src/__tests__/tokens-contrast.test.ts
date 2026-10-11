import { describe, test, expect } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * WCAG AA contrast gate for the theme tokens in src/app/globals.css.
 *
 * The palette was restored to design2.md's documented values, and that palette
 * is mid-tone, so alpha-modified foregrounds fail badly: `#1C201C` at 50% over
 * the sage canvas `#98A783` composites to `#5A634F` at 2.40:1. Rather than
 * trust hand arithmetic, this test parses the real CSS and fails the build on
 * any pair under the threshold.
 *
 * Border tokens are intentionally excluded: they are color-mix expressions
 * used for hairlines, not text, and AA does not apply to them.
 */

const CSS_PATH = join(process.cwd(), 'src', 'app', 'globals.css');

/** Token pairs that must be readable, per theme. Order is (fg, bg). */
const LIGHT_PAIRS: [string, string][] = [
  ['foreground', 'background'],
  ['foreground', 'card'],
  ['foreground', 'popover'],
  ['foreground', 'muted'],
  ['card-foreground', 'card'],
  ['popover-foreground', 'popover'],
  ['primary-foreground', 'primary'],
  ['secondary-foreground', 'secondary'],
  ['muted-foreground', 'background'],
  ['muted-foreground', 'card'],
  ['muted-foreground', 'muted'],
  ['accent-foreground', 'accent'],
  ['destructive', 'background'],
  ['destructive', 'card'],
];

const DARK_PAIRS = LIGHT_PAIRS.map(pair => [...pair] as [string, string]);

const AA_NORMAL_TEXT = 4.5;

function srgbToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string): number {
  const match = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) {
    throw new Error(`Not a 6-digit hex colour: "${hex}"`);
  }
  const int = parseInt(match[1], 16);
  const r = (int >> 16) & 0xff;
  const g = (int >> 8) & 0xff;
  const b = int & 0xff;
  return (
    0.2126 * srgbToLinear(r) +
    0.7152 * srgbToLinear(g) +
    0.0722 * srgbToLinear(b)
  );
}

function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Pull `--name: #hex;` declarations out of a single block of the stylesheet.
 * Returns an empty map when the block is absent.
 */
function readBlock(css: string, selector: string): Map<string, string> {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) return new Map();

  const open = css.indexOf('{', start);
  const close = css.indexOf('}', open);
  const body = css.slice(open + 1, close);

  const tokens = new Map<string, string>();
  for (const line of body.split('\n')) {
    const match = /^\s*--([a-z0-9-]+)\s*:\s*(#[0-9a-f]{6})\s*;/i.exec(line);
    if (match) {
      tokens.set(match[1], match[2]);
    }
  }
  return tokens;
}

const css = readFileSync(CSS_PATH, 'utf8');
const light = readBlock(css, ':root');
const dark = readBlock(css, '.dark');

describe('theme tokens', () => {
  test('the stylesheet still declares both theme blocks', () => {
    expect(light.size).toBeGreaterThan(0);
    expect(dark.size).toBeGreaterThan(0);
  });

  test('.dark defines the same tokens as :root', () => {
    for (const key of light.keys()) {
      expect(dark.has(key)).toBe(true);
    }
  });
});

describe('light theme contrast', () => {
  for (const [fg, bg] of LIGHT_PAIRS) {
    test(`${fg} on ${bg} meets AA`, () => {
      const fgHex = light.get(fg);
      const bgHex = light.get(bg);
      expect(fgHex).toBeDefined();
      expect(bgHex).toBeDefined();

      const ratio = contrastRatio(fgHex!, bgHex!);
      expect({
        pair: `${fg} on ${bg}`,
        ratio: Math.round(ratio * 100) / 100,
        threshold: AA_NORMAL_TEXT,
      }).toEqual({
        pair: `${fg} on ${bg}`,
        ratio: expect.any(Number),
        threshold: AA_NORMAL_TEXT,
      });
      expect(ratio).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    });
  }
});

describe('dark theme contrast', () => {
  for (const [fg, bg] of DARK_PAIRS) {
    test(`${fg} on ${bg} meets AA`, () => {
      const fgHex = dark.get(fg);
      const bgHex = dark.get(bg);
      expect(fgHex).toBeDefined();
      expect(bgHex).toBeDefined();

      const ratio = contrastRatio(fgHex!, bgHex!);
      expect(ratio).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    });
  }
});

describe('regression guards for the documented contrast failures', () => {
  test('muted-foreground is not an alpha wash of foreground', () => {
    expect(light.get('muted-foreground')).toBe('#283020');
    expect(light.get('muted-foreground')).not.toBe(light.get('foreground'));
  });

  test('primary-foreground is near-black, not white', () => {
    expect(light.get('primary-foreground')?.toLowerCase()).toBe('#1c201c');
  });

  test('the old foreground-at-50%-on-sage composite really would have failed', () => {
    // Guards the premise of this whole file: if this ever passes, the reason
    // muted-foreground had to become a solid token no longer holds.
    const composite = '#5a634f';
    const ratio = contrastRatio(composite, light.get('background')!);
    expect(ratio).toBeLessThan(AA_NORMAL_TEXT);
  });

  test('white on the primary orange really would have failed', () => {
    const ratio = contrastRatio('#ffffff', light.get('primary')!);
    expect(ratio).toBeLessThan(AA_NORMAL_TEXT);
  });
});
