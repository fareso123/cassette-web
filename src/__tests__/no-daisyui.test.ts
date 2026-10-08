import { describe, test, expect } from 'bun:test';
import { readFileSync } from 'node:fs';
import { globSync } from 'node:fs';

/**
 * Guards the daisyUI removal.
 *
 * daisyUI and shadcn both register `--color-primary`, `--color-secondary`,
 * `--color-accent`, `--color-neutral`, and `--color-ring`. Two Tailwind v4
 * `@theme` blocks defining the same variable is last-writer-wins with no
 * warning, so a reintroduced `@plugin "daisyui"` would silently fight the
 * shadcn tokens rather than fail loudly. This test is the loud failure.
 */

/** daisyUI component classes that would clash with a shadcn component name. */
const DAISY_CLASSES = [
  'btn',
  'btn-primary',
  'btn-secondary',
  'btn-accent',
  'btn-neutral',
  'btn-ghost',
  'btn-outline',
  'btn-link',
  'btn-block',
  'btn-sm',
  'btn-md',
  'btn-lg',
  'btn-xs',
  'btn-circle',
  'card',
  'card-body',
  'card-title',
  'navbar',
  'badge',
  'tabs',
  'tab',
  'modal',
  'drawer',
  'menu',
  'steps',
  'stat',
  'skeleton',
  'loading',
  'tooltip',
  'dropdown',
  'input',
  'select',
  'textarea',
  'checkbox',
  'radio',
  'toggle',
  'range',
  'hero',
  'footer',
  'link',
  'table',
  'toast',
  'alert',
  'avatar',
  'carousel',
  'chat',
  'collapse',
  'divider',
  'indicator',
  'join',
  'mask',
  'progress',
  'radial-progress',
  'rating',
  'swap',
  'timeline',
  'validator',
];

/** daisyUI semantic colour tokens. `neutral` and `input` are excluded because
 * they are also legitimate shadcn class-name substrings; the CSS check below
 * catches their variable form anyway. */
const DAISY_COLORS = [
  'base-100',
  'base-200',
  'base-300',
  'base-content',
  'primary-content',
  'secondary-content',
  'accent-content',
  'neutral-content',
  'info',
  'success',
  'warning',
];

function sourceFiles(): string[] {
  return globSync('src/**/*.{ts,tsx,css}', { cwd: process.cwd() });
}

describe('daisyUI is gone', () => {
  test('daisyui is not a dependency', () => {
    const pkg = JSON.parse(
      readFileSync('package.json', 'utf8')
    ) as Record<string, Record<string, string>>;
    const all = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
    expect(all.daisyui).toBeUndefined();
  });

  test('globals.css declares no daisyui plugin', () => {
    const css = readFileSync('src/app/globals.css', 'utf8');
    expect(css).not.toMatch(/@plugin\s+["']daisyui/);
    expect(css).not.toMatch(/--color-(base|primary-content|neutral)-/);
  });

  test('no source file uses a daisyui class', () => {
    const offenders: string[] = [];

    for (const file of sourceFiles()) {
      const body = readFileSync(file, 'utf8');

      // Only className/class attributes can carry daisyUI classes, and the
      // token must appear as a complete word so `btn` does not fire on
      // `btnGroup` and `info` does not fire on `information`.
      for (const match of body.matchAll(
        /(?:className|class)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\})/g
      )) {
        const attr = match[1] ?? match[2] ?? match[3] ?? '';

        for (const token of attr.split(/\s+/)) {
          const cleaned = token.replace(/[^\w-]/g, '');
          if (
            DAISY_CLASSES.includes(cleaned) ||
            DAISY_COLORS.includes(cleaned)
          ) {
            offenders.push(`${file}: "${cleaned}"`);
          }
        }
      }
    }

    expect(offenders).toEqual([]);
  });

  test('shadcn is configured and owns the ui directory', () => {
    const config = JSON.parse(readFileSync('components.json', 'utf8')) as {
      aliases: { components: string; utils: string; ui: string };
    };
    expect(config.aliases.ui).toBe('@/components/ui');
    expect(config.aliases.utils).toBe('@/lib/utils');
  });
});
