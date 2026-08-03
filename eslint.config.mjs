import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  //  athom,
  // eslint.configs.recommended,
  // tseslint.configs.strict,
  // tseslint.configs.stylistic,
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      parserOptions: { project: true },
    },
    rules: {
      'no-console': 'warn',
      'no-unsafe-optional-chaining': 'error',
      'no-unused-vars': 'warn',
      strict: 'warn',
    },
  },
  { ignores: ['node_modules/*', 'build/*', 'dist/*', '**/*.spec.ts', '*.config.mjs', 'src/www'] },
);
