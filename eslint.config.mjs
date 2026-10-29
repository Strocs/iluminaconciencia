import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import tailwindcss from 'eslint-plugin-tailwindcss'
import prettier from 'eslint-config-prettier/flat'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  tailwindcss.configs.recommended,
  {
    settings: {
      tailwindcss: {
        /** @type {import('eslint-plugin-tailwindcss').PluginSettings} */
        cssConfigPath: './app/_styles/globals.css',
        functions: ['cn', 'tv']
      }
    }
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Linked worktrees own their source and generated files.
    '.worktrees/**',
    // Local generated probes and evidence are not application source.
    'output/**',
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts'
  ])
])

export default eslintConfig
