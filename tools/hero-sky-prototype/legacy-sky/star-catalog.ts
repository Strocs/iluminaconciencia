/**
 * Static hero catalogue: 60 approved records for 51 labels (50 stars/systems
 * and the 10 existing Pleiades members), in original BSC5 source order.
 * Selected offline; no runtime catalogue selection or full-data dependency.
 * Original numeric literals and source ordinals preserve calibrated profiles.
 * Full 2,087-record predecessor preserved byte-for-byte outside the runtime:
 * docs/backups/hero/star-catalog.before-labeled-60.ts.bak
 * SHA-256: ed3b8aff9b1eec11d9242cc12175afb2f934089b5d6c92e3a36418d43af0349d
 */

export interface StarCatalogRecord {
  readonly ra: number
  readonly dec: number
  readonly mag: number
  readonly bv: number
}

export const starCatalog: readonly StarCatalogRecord[] = [
  { ra: 3.038, dec: 4.0897, mag: 2.53, bv: 1.64 },
  { ra: 3.1361, dec: 40.9556, mag: 2.12, bv: -0.05 },
  { ra: 3.7467, dec: 24.2894, mag: 5.46, bv: -0.04 },
  { ra: 3.7479, dec: 24.1133, mag: 3.7, bv: -0.11 },
  { ra: 3.7527, dec: 24.8392, mag: 5.64, bv: -0.07 },
  { ra: 3.7535, dec: 24.4672, mag: 4.3, bv: -0.11 },
  { ra: 3.7638, dec: 24.3678, mag: 3.87, bv: -0.07 },
  { ra: 3.7721, dec: 23.9483, mag: 4.18, bv: -0.06 },
  { ra: 3.7914, dec: 24.105, mag: 2.87, bv: -0.09 },
  { ra: 3.8058, dec: 23.4211, mag: 5.45, bv: -0.07 },
  { ra: 3.8194, dec: 24.0533, mag: 3.63, bv: -0.09 },
  { ra: 3.8198, dec: 24.1367, mag: 5.09, bv: -0.08 },
  { ra: 4.5987, dec: 16.5092, mag: 0.85, bv: 1.54 },
  { ra: 5.2423, dec: -8.2017, mag: 0.12, bv: -0.03 },
  { ra: 5.2782, dec: 45.9981, mag: 0.08, bv: 0.8 },
  { ra: 5.4189, dec: 6.3497, mag: 1.64, bv: -0.22 },
  { ra: 5.4382, dec: 28.6075, mag: 1.65, bv: -0.13 },
  { ra: 5.5334, dec: -0.2992, mag: 2.23, bv: -0.22 },
  { ra: 5.5455, dec: -17.8222, mag: 2.58, bv: 0.21 },
  { ra: 5.6036, dec: -1.2019, mag: 1.7, bv: -0.19 },
  { ra: 5.6793, dec: -1.9428, mag: 2.05, bv: -0.21 },
  { ra: 5.7959, dec: -9.6697, mag: 2.06, bv: -0.17 },
  { ra: 5.9195, dec: 7.4069, mag: 0.5, bv: 1.85 },
  { ra: 5.9921, dec: 44.9475, mag: 1.9, bv: 0.03 },
  { ra: 6.3783, dec: -17.9558, mag: 1.98, bv: -0.23 },
  { ra: 6.3992, dec: -52.6958, mag: -0.72, bv: 0.15 },
  { ra: 6.6285, dec: 16.3992, mag: 1.93, bv: 0.0 },
  { ra: 6.7525, dec: -16.7161, mag: -1.46, bv: 0.0 },
  { ra: 6.9771, dec: -28.9722, mag: 1.5, bv: -0.21 },
  { ra: 7.1399, dec: -26.3933, mag: 1.84, bv: 0.68 },
  { ra: 7.5767, dec: 31.8883, mag: 1.98, bv: 0.03 },
  { ra: 7.655, dec: 5.225, mag: 0.38, bv: 0.42 },
  { ra: 7.7553, dec: 28.0261, mag: 1.14, bv: 1.0 },
  { ra: 8.0598, dec: -40.0033, mag: 2.25, bv: -0.26 },
  { ra: 8.1589, dec: -47.3367, mag: 1.78, bv: -0.22 },
  { ra: 8.3752, dec: -59.5097, mag: 1.86, bv: 1.28 },
  { ra: 8.7451, dec: -54.7083, mag: 1.96, bv: 0.04 },
  { ra: 9.1333, dec: -43.4325, mag: 2.21, bv: 1.66 },
  { ra: 9.22, dec: -69.7172, mag: 1.68, bv: 0.0 },
  { ra: 9.2848, dec: -59.2753, mag: 2.25, bv: 0.18 },
  { ra: 9.4598, dec: -8.6586, mag: 1.98, bv: 1.44 },
  { ra: 10.1395, dec: 11.9672, mag: 1.35, bv: -0.11 },
  { ra: 10.3329, dec: 19.8417, mag: 2.61, bv: 1.15 },
  { ra: 11.0307, dec: 56.3825, mag: 2.37, bv: -0.02 },
  { ra: 11.0621, dec: 61.7508, mag: 1.79, bv: 1.07 },
  { ra: 11.2351, dec: 20.5236, mag: 2.56, bv: 0.12 },
  { ra: 11.8177, dec: 14.5719, mag: 2.14, bv: 0.09 },
  { ra: 11.8972, dec: 53.6947, mag: 2.44, bv: 0.0 },
  { ra: 12.4433, dec: -63.0992, mag: 1.33, bv: -0.24 },
  { ra: 12.5194, dec: -57.1133, mag: 1.63, bv: 1.59 },
  { ra: 12.7953, dec: -59.6886, mag: 1.25, bv: -0.23 },
  { ra: 12.9005, dec: 55.9597, mag: 1.77, bv: -0.02 },
  { ra: 13.3987, dec: 54.9253, mag: 2.27, bv: 0.02 },
  { ra: 13.4199, dec: -11.1614, mag: 0.98, bv: -0.23 },
  { ra: 13.7923, dec: 49.3133, mag: 1.86, bv: -0.19 },
  { ra: 14.0637, dec: -60.3731, mag: 0.61, bv: -0.23 },
  { ra: 14.261, dec: 19.1825, mag: -0.04, bv: 1.23 },
  { ra: 14.66, dec: -60.8353, mag: -0.01, bv: 0.71 },
  { ra: 15.5781, dec: 26.7147, mag: 2.23, bv: -0.02 },
  { ra: 16.4901, dec: -26.4319, mag: 0.96, bv: 1.83 }
]

/** Original source ordinals, not positions in this 60-record array. */
export const starCatalogOriginalIndices: readonly number[] = [
  146, 160, 293, 295, 297, 299, 302, 308, 311, 317, 323, 324, 548, 742, 754, 817, 822, 865, 871, 907, 945, 993, 1048,
  1078, 1236, 1248, 1359, 1407, 1516, 1586, 1773, 1807, 1859, 2000, 2034, 2115, 2276, 2415, 2448, 2476, 2527, 2732,
  2799, 3021, 3029, 3075, 3240, 3260, 3414, 3444, 3530, 3564, 3697, 3704, 3816, 3891, 3940, 4051, 4309, 4560
]
