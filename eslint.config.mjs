// @ts-check

import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  eslint.configs.recommended, // Enables recommended ESLint rules
  ...tseslint.configs.recommended, // Enables recommended TypeScript ESLint rules
  {
    files: ['**/*.ts', '**/*.tsx'], // Apply these rules only to TypeScript files
    languageOptions: {
      parser: tseslint.parser, // Specify the TypeScript parser
      parserOptions: {
        project: './tsconfig.json', // Path to your tsconfig.json for type-aware linting
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      // Custom rules or overrides for TypeScript files
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    // Optional: Configuration for JavaScript files if your project includes them
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    languageOptions: {
      globals: {
        // Define global variables for browser and Node.js environments
        browser: true,
        node: true,
      },
    },
    rules: {
      // Custom rules or overrides for JavaScript files
      'no-console': 'warn',
    },
  },
  {
    // Optional: Ignoring specific files or directories
    ignores: ['dist/**', 'node_modules/**', '.next/**', "next-env.d.ts"],
  }
);