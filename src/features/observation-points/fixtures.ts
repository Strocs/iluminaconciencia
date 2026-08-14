import { OBSERVATION_STATUS, type ObservationPoint } from '../../domain/observation-point'

export const observationPoints: ReadonlyArray<ObservationPoint> = [
  {
    id: 'valle-norte',
    name: 'Valle Norte',
    region: 'Región de Coquimbo',
    coordinates: { latitude: -30.2, longitude: -70.8 },
    status: OBSERVATION_STATUS.AVAILABLE,
    updatedAt: '2026-07-18',
    everydayMeaning:
      'Un punto de referencia claro para comprender cómo se siente un cielo oscuro en la vida cotidiana.',
    context: 'Un fixture provisional para la primera ruta de exploración.',
    indicators: [
      {
        label: 'Calidad del cielo',
        value: '21.4 mag/arcsec²',
        meaning: 'Un cielo más oscuro permite ver más estrellas.'
      },
      {
        label: 'Ventana de lectura',
        value: 'Muestra nocturna',
        meaning: 'Es una observación resumida, no un flujo en tiempo real.'
      }
    ]
  },
  {
    id: 'coastal-ridge',
    name: 'Cordillera Costera',
    region: 'Región de Coquimbo',
    coordinates: { latitude: -29.9, longitude: -71.3 },
    status: OBSERVATION_STATUS.OUTDATED,
    updatedAt: '2025-11-03',
    everydayMeaning:
      'Un lugar donde una actualización futura permitirá comparar las condiciones nocturnas costeras e interiores.',
    context: 'El fixture muestra intencionadamente cómo se comunica un dato desactualizado.',
    indicators: [
      {
        label: 'Calidad del cielo',
        value: '20.1 mag/arcsec²',
        meaning: 'Debe interpretarse junto con su fecha de actualización.'
      }
    ]
  },
  {
    id: 'forest-edge',
    name: 'Borde del bosque',
    region: 'Región de La Araucanía',
    coordinates: { latitude: -38.7, longitude: -72.5 },
    status: OBSERVATION_STATUS.NO_DATA,
    updatedAt: null,
    everydayMeaning: 'Un punto conocido que espera su primera observación utilizable.',
    context: 'No se muestran indicadores hasta que haya datos disponibles.',
    indicators: []
  }
]

export function getObservationPoint(id: string): ObservationPoint {
  return observationPoints.find((point) => point.id === id) ?? observationPoints[0]
}
