export const lightPollutionConfig = {
  palette: {
    source: '#F6A967',
    middle: '#54392E',
    edge: '#1A1C28'
  },
  source: {
    initialOpacity: 1,
    startProgress: 0,
    endProgress: 0.8
  },
  halo: {
    startProgress: 0,
    residualProgress: 0.33,
    endProgress: 0.8,
    reference: {
      stops: [4, 58, 90],
      alphas: [0.98, 0.1, 0]
    },
    residual: {
      stops: [4, 40, 60],
      alphas: [0.9, 0.1, 0]
    },
    final: {
      stops: [4, 20, 60],
      alphas: [0, 0, 0]
    }
  },
  geometry: {
    source: {
      mobile: { width: 22, height: 14, x: 50, y: 4 },
      desktop: { width: 7, height: 9, x: 50, y: 26 }
    },
    halo: {
      mobile: { width: 190, height: 150, x: 50, y: 58, focusX: 50, focusY: 14 },
      desktop: { width: 159, height: 188, x: 50, y: 73, focusX: 50, focusY: 25 }
    }
  }
} as const
