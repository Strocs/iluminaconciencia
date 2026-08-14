import js from '@eslint/js'
import tseslint, { parser as tsParser } from 'typescript-eslint'
import { defineConfig } from 'eslint/config'
import astro from 'eslint-plugin-astro'
import tailwindcss from 'eslint-plugin-tailwindcss'

export default defineConfig([
  {
    ignores: ['.astro/', '.vercel/', 'dist/', 'pnpm-lock.yaml', 'node_modules/']
  },
  // Base config: all files get recommended rules
  {
    files: ['**/*.{js,jsx,ts,tsx,astro}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      tailwindcss.configs.recommended,
      astro.configs.recommended
    ],
    settings: {
      tailwindcss: {
        cssConfigPath: 'src/styles/global.css'
      }
    },
    languageOptions: {
      parserOptions: { parser: tsParser, extraFileExtensions: ['.astro'] }
    }
  }
])
