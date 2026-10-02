import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const mapSection = await readFile(new URL('../src/features/map/MapSection.astro', import.meta.url), 'utf8')

const drawer = await readFile(new URL('../src/features/map/InstrumentDrawer.astro', import.meta.url), 'utf8')

const filterPanel = await readFile(new URL('../src/features/map/FilterPanel.astro', import.meta.url), 'utf8')

test('anchors the filter actions at the bottom while retaining their gap and disabled link', () => {
  const aside = filterPanel.match(/<aside[\s\S]*?>/)?.[0]
  const selectAll = filterPanel.match(/<(?:Button|LinkButton)[^>]*data-select-all[^>]*>/)?.[0]
  const dataTable = filterPanel.match(/<LinkButton\b(?=[^>]*href="#")(?=[^>]*disabled)[^>]*>/)?.[0]

  assert.ok(aside, 'filter panel aside exists')
  assert.ok(selectAll, 'select-all button exists')
  assert.ok(dataTable, 'data table link exists')
  assert.match(aside, /flex-col/)
  assert.match(selectAll, /mt-auto/)
  assert.match(filterPanel, /data-select-all[\s\S]*?<LinkButton/)
  assert.match(dataTable, /href="#"[\s\S]*?disabled/)
  assert.match(dataTable, /mt-4/)
})

test('keeps SQC available alongside data-driven instrument filters', () => {
  assert.match(mapSection, /const types = \[\.\.\.new Set\(\['SQC', \.\.\.instruments\.map\(\(\{ type \}\) => type\)\]\)\]\.sort\(\)/)
  assert.match(mapSection, /const selectedTypes = new Set\(types\)/)
  assert.match(mapSection, /types\.forEach\(\(type\) => selectedTypes\.add\(type\)\)/)
  assert.match(mapSection, /filterByType\(instruments, selectedTypes\)/)
})

test('keeps the detail drawer rendered and inaccessible while closed, with responsive motion', () => {
  const aside = drawer.match(/<aside[\s\S]*?>/)?.[0]
  assert.ok(aside, 'detail drawer aside exists')
  assert.doesNotMatch(aside, /(?:^|\s)hidden(?:\s|$)|data-open:flex/)
  assert.match(aside, /(?:^|\s)flex(?:\s|$)/)
  assert.match(aside, /w-0\s+shrink-0/)
  assert.match(aside, /p-0\s+pt-0\s+pl-0/)
  assert.match(aside, /data-open:w-\[220px\]/)
  assert.match(aside, /data-open:pt-8\s+data-open:pl-4/)
  assert.match(aside, /opacity-0[\s\S]*data-open:opacity-100/)
  assert.match(aside, /translate-x-2[\s\S]*data-open:translate-x-0/)
  assert.match(aside, /max-md:w-full[\s\S]*max-md:translate-x-full[\s\S]*max-md:data-open:translate-x-0/)
  assert.match(aside, /motion-reduce:transition-none/)
  assert.match(mapSection, /drawerEl\.inert = filtersOpen \|\| !drawerOpen/)
})

test('shows concise point context only when values are available', async () => {
  assert.doesNotMatch(drawer, /data-drawer-location|data-drawer-altitude|Altitud/)
  assert.match(drawer, /data-drawer-weather/)
  assert.match(drawer, /data-drawer-equipment/)
  assert.match(drawer, /data-drawer-summary/)
  assert.match(drawer, /data-drawer-bortle/)
  assert.match(drawer, /text-sm\/relaxed/)

  const drawerLogic = await readFile(new URL('../src/features/map/drawer.ts', import.meta.url), 'utf8')
  assert.doesNotMatch(drawerLogic, /data-drawer-location|data-drawer-altitude|instrument\.location|details\.site|details\.altitude|No disponible|Sin datos|—/)
  assert.match(drawerLogic, /instrument\.details\.weather/)
  assert.match(drawerLogic, /instrument\.dataCount/)
  assert.match(drawerLogic, /instrument\.mag/)
  assert.match(drawerLogic, /instrument\.type/)
  assert.match(drawerLogic, /instrument\.summaryPeriod/)
  assert.match(drawerLogic, /instrument\.dataPercent/)
  assert.match(drawerLogic, /es-CL[\s\S]*month: 'long'[\s\S]*year: 'numeric'/)
  assert.match(drawerLogic, /canonical/)
})

test('styles the drawer title and renders canonical Bortle details as a vertical labeled scale', async () => {
  assert.match(drawer, /<h3[^>]*class="[^"]*font-body[^\"]*text-primary/)
  assert.match(drawer, /data-bortle-label/)
  assert.match(drawer, /data-bortle-level/)
  assert.match(drawer, /data-bortle-marker/)
  assert.match(drawer, /data-bortle-classification/)
  assert.match(drawer, /data-bortle-sqm/)
  assert.match(drawer, /writing-mode:vertical-rl|\[writing-mode:vertical-rl\]/)
  assert.match(drawer, /data-bortle-label[\s\S]*data-bortle-scale[\s\S]*data-bortle-level[\s\S]*data-bortle-marker[\s\S]*data-bortle-classification[\s\S]*data-bortle-sqm/)
  assert.match(drawer, /data-bortle-scale[^>]*class="[^"]*flex-col[^"]*items-center[^"]*"[\s\S]*data-bortle-level[\s\S]*data-bortle-marker/)
  assert.doesNotMatch(drawer, /font-heading text-6xl|data-bortle-level[^>]*rounded-full/)

  const source = await readFile(new URL('../src/features/map/drawer.ts', import.meta.url), 'utf8')
  assert.match(source, /canonical\.color/)
  assert.match(source, /canonical\.label/)
  assert.match(source, /canonical\.name/)
  assert.match(source, /canonical\.sqmRange/)
  assert.match(source, /bortle\.hidden = !canonical/)
  assert.match(source, /bortleLevel\.textContent = canonical\.label/)
  assert.match(source, /bortleMarker\.style\.backgroundColor = canonical\.color/)
  assert.match(source, /bortleClassification\.textContent = canonical\.name/)
  assert.match(source, /bortleSqm\.textContent = canonical\.sqmRange/)
})

test('shows one concise localized snapshot summary row only when summary data exists', async () => {
  assert.match(drawer, /data-drawer-summary-row[^>]*hidden/)
  assert.match(drawer, /data-drawer-summary/)

  const source = await readFile(new URL('../src/features/map/drawer.ts', import.meta.url), 'utf8')
  assert.match(source, /summaryRow\.hidden = !summaryValue/)
  assert.match(source, /summary\.textContent = summaryValue/)
  assert.match(source, /instrument\.summaryPeriod/)
  assert.match(source, /instrument\.dataPercent/)
  assert.match(source, /month: 'long'[\s\S]*year: 'numeric'/)
  assert.match(source, /timeZone: 'UTC'/)
  assert.match(source, /englishMonthToSpanish/)
  assert.match(source, /aug: 'agosto'/)
  assert.match(source, /\$\{month\} de \$\{monthOnlyPeriod\[2\]\}/)
  assert.match(source, /dataPercent\?\.toLocaleString\('es-CL', \{ maximumFractionDigits: 2 \}\)/)
  assert.match(source, /es-CL/)
})

test('uses LinkButton for both drawer actions with the information arrow and button close mode', () => {
  const informationAction = drawer.match(/<LinkButton\s+data-drawer-link[\s\S]*?class="[^"]*"/)?.[0]
  const closeAction = drawer.match(/<LinkButton\s+data-drawer-close[\s\S]*?class="[^"]*"/)?.[0]

  assert.ok(informationAction, 'information action exists')
  assert.ok(closeAction, 'close action exists')
  assert.match(informationAction, /href="\/"/)
  assert.doesNotMatch(informationAction, /variant=/)
  assert.match(informationAction, /rounded-sm/)
  assert.match(informationAction, /border-primary/)
  assert.match(informationAction, /text-primary/)
  assert.match(informationAction, /bg-transparent/)
  assert.match(informationAction, /h-8/)
  assert.doesNotMatch(informationAction, /\[&_svg\]:hidden/)
  assert.match(closeAction, /as="btn"/)
  assert.match(closeAction, /rounded-sm/)
  assert.match(closeAction, /border-foreground/)
  assert.match(closeAction, /text-foreground/)
  assert.match(closeAction, /bg-transparent/)
  assert.match(closeAction, /h-8/)
  assert.doesNotMatch(closeAction, /\[&_svg\]:hidden/)
  assert.doesNotMatch(drawer, /import Button|<Button\b/)
})
