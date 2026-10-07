import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

// eslint-plugin-react (nested under eslint-config-next) calls the removed
// context.getFilename() API and crashes under ESLint 10. Strip every
// `react/*` rule from the shared configs so the plugin never loads a rule.
// Removing the plugin itself is not an option: the Next configs require it.
function withoutReactPlugin(entries) {
  return entries.map((entry) => {
    if (!entry?.rules) return entry;
    const rules = Object.fromEntries(
      Object.entries(entry.rules).filter(([name]) => !name.startsWith('react/'))
    );
    return { ...entry, rules };
  });
}

const config = [
  {
    ignores: ['.next/**', 'node_modules/**', 'dist/**', 'next-env.d.ts'],
  },
  ...withoutReactPlugin(nextCoreWebVitals),
  ...withoutReactPlugin(nextTypescript),
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];

export default config;
