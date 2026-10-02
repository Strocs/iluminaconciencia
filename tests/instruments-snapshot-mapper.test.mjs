import assert from 'node:assert/strict'
import test from 'node:test'
import { mapSnapshotStations } from '../src/shared/features/instruments/dal/snapshot-mapper.ts'

test('projects snapshot station metadata into compact map instruments', () => {
  const [instrument] = mapSnapshotStations([
    {
      id: 'station-42',
      modelRoute: 'tessw',
      name: 'Observatorio Demo',
      locality: 'Valle Claro',
      municipality: 'Comuna Norte',
      sourceUrl: 'https://iluminaconciencia.userena.digital/dashboard/tessw/station-42/',
      homepageSummary: {
        instrumentCode: 'W',
        bortleLevel: 4,
        meanMagnitude: 20.75,
        dataCount: 8123,
        dataPercent: 46.44,
        period: 'Aug 2026'
      },
      location: { latitude: -30.5, longitude: -71.25 }
    }
  ])

  assert.deepEqual(instrument, {
    id: 'station-42',
    name: 'Observatorio Demo',
    location: 'Valle Claro',
    type: 'TESS-W',
    position: { lat: -30.5, lng: -71.25 },
    bortleLevel: 4,
    mag: 20.75,
    dataCount: 8123,
    dataPercent: 46.44,
    summaryPeriod: 'Aug 2026',
    detailUrl: 'https://iluminaconciencia.userena.digital/dashboard/tessw/station-42/',
    details: { altitude: null, weather: null, site: 'Comuna Norte' }
  })
})

test('rejects unsupported snapshot instrument codes', () => {
  assert.throws(
    () => mapSnapshotStations([
      {
        id: 'station-invalid',
        modelRoute: 'unknown',
        name: 'Observatorio desconocido',
        locality: 'Localidad Norte',
        municipality: null,
        sourceUrl: 'https://iluminaconciencia.userena.digital/dashboard/unknown/station-invalid/',
        homepageSummary: {
          instrumentCode: 'UNKNOWN',
          bortleLevel: null,
          meanMagnitude: null,
          dataCount: null,
          dataPercent: null,
          period: null
        },
        location: { latitude: -30, longitude: -71 }
      }
    ]),
    /Unsupported instrument code: UNKNOWN/
  )
})

test('keeps absent summary values unavailable and does not duplicate locality as site', () => {
  const [instrument] = mapSnapshotStations([
    {
      id: 'station-unknown',
      modelRoute: 'tess4c',
      name: 'Estación sin mediciones',
      locality: 'Localidad Sur',
      municipality: 'Localidad Sur',
      sourceUrl: 'https://iluminaconciencia.userena.digital/dashboard/tess4c/station-unknown/',
      homepageSummary: {
        instrumentCode: '4C',
        bortleLevel: null,
        meanMagnitude: null,
        dataCount: null,
        dataPercent: null,
        period: null
      },
      location: { latitude: -29.75, longitude: -70.5 }
    }
  ])

  assert.equal(instrument.type, 'TESS-4C')
  assert.deepEqual(instrument.position, { lat: -29.75, lng: -70.5 })
  assert.equal(instrument.bortleLevel, null)
  assert.equal(instrument.mag, null)
  assert.equal(instrument.dataCount, null)
  assert.equal(instrument.dataPercent, null)
  assert.equal(instrument.summaryPeriod, null)
  assert.deepEqual(instrument.details, { altitude: null, weather: null, site: null })
})
