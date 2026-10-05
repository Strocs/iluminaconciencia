// @ts-check
import { defineConfig, fontProviders } from 'astro/config'

import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Baskervville',
      cssVariable: '--font-baskervville',
      weights: [400, 600, 800],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      fallbacks: ['Georgia', 'serif']
    },
    {
      provider: fontProviders.google(),
      name: 'Ubuntu',
      cssVariable: '--font-ubuntu',
      weights: [400, 600, 800],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif']
    }
  ],
  vite: {
    plugins: [tailwindcss()]
  }
})
