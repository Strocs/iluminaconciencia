/** @type { import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions }*/
const config = {
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindStylesheet: './src/styles/globals.css',
  tailwindFunctions: ['cn'],
  tailwindAttributes: ['*Class'],
  printWidth: 120,
  trailingComma: 'none',
  singleQuote: true,
  tabWidth: 2,
  semi: false
}

export default config
