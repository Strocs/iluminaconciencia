import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { lightPollutionConfig } from '../src/features/hero/capabilities/light-pollution/config.ts'
import { nightSkyConfig } from '../src/features/hero/capabilities/night-sky/config.ts'

const componentPath = new URL(
  '../src/features/hero/capabilities/light-pollution/LightPollution.astro',
  import.meta.url
)
const capabilityPath = new URL(
  '../src/features/hero/capabilities/light-pollution/light-pollution.ts',
  import.meta.url
)

test('renders one warm glow that originates at the bottom and fades upward', async () => {
  const component = await readFile(componentPath, 'utf8')

  assert.equal(lightPollutionConfig.palette.source, '#F6A967')
  assert.equal(nightSkyConfig.starOpacity.initial, 0.12)
  assert.equal(nightSkyConfig.starOpacity.full, 1)
  assert.equal(nightSkyConfig.starOpacity.fullProgress, 0.7)
  assert.match(component, /data-hero-light-pollution-horizon/)
  assert.match(component, /linear-gradient\(to_top,/)
  assert.match(component, /transparent_100%/)
  assert.match(component, /--horizon-color: \$\{palette\.source\}/)
  assert.match(component, /opacity: \$\{horizon\.initialOpacity\}/)
  assert.match(component, /absolute inset-x-0 bottom-0 h-full/)
  assert.doesNotMatch(component, /data-hero-light-pollution-(?:source|halo)/)
})

test('fades the horizon to zero by normalized progress 0.8 and supports reversal', async () => {
  const capability = await readFile(capabilityPath, 'utf8')

  assert.equal(lightPollutionConfig.horizon.startProgress, 0)
  assert.equal(lightPollutionConfig.horizon.endProgress, 0.8)
  assert.match(capability, /opacity: config\.horizon\.initialOpacity/)
  assert.match(capability, /opacity: 0/)
  assert.match(capability, /timeline\.progress\(progress\)/)
  assert.match(capability, /ease: 'none'/)
})
