export const lightPollutionConfig = {
  palette: {
    source: '#F6A967'
  },
  backlight: {
    centerBoost: 1.25,
    rimWidth: 2,
    rimOpacity: 0.75,
    rimWhiteMix: 0.4,
    rimBlur: 2,
    haloBlur: 14,
    haloOpacity: 0.7
  },
  horizon: {
    initialOpacity: 1,
    startProgress: 0,
    endProgress: 0.8
  }
} as const
