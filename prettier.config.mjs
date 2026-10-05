/** @type { import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions }*/
export default {
  plugins: ['prettier-plugin-astro', 'prettier-plugin-tailwindcss'],
  tailwindStylesheet: 'src/styles/global.css',
  tailwindFunctions: ['cn'],
  tailwindAttributes: ['*Class'],
  printWidth: 120,
  trailingComma: 'none',
  singleQuote: true,
  tabWidth: 2,
  semi: false,
  overrides: [{ files: '*.astro', options: { parser: 'astro' } }]
}
