import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'src/assets/vendor/**'],
  },
  {
    ...js.configs.recommended,
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      ...js.configs.recommended.rules,
      curly: ['error', 'all'],
    },
  },
  {
    files: ['scripts/**/*.mjs', '*.mjs'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['src/assets/*.js'],
    languageOptions: {
      sourceType: 'script',
      globals: {
        ...globals.browser,
        d3: 'readonly',
      },
    },
  },
];
