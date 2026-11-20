export interface ChileRegion {
  code: string
  label: string
  bounds: [west: number, south: number, east: number, north: number]
}

// Bounds from the upstream geometry, rounded outward; see public/maps/README.md.
export const coquimboRegion: ChileRegion = {
  code: 'CL-CO',
  label: 'Coquimbo',
  bounds: [-71.7175, -32.2822, -69.809, -29.0378]
}

export const chileRegions: ChileRegion[] = [
  { code: 'CL-AP', label: 'Arica y Parinacota', bounds: [-70.3792, -19.2294, -68.9116, -17.4983] },
  { code: 'CL-TA', label: 'Tarapacá', bounds: [-70.2854, -21.6299, -68.4048, -18.9366] },
  { code: 'CL-AN', label: 'Antofagasta', bounds: [-70.738, -26.0616, -66.9901, -20.9345] },
  { code: 'CL-AT', label: 'Atacama', bounds: [-71.5257, -29.5352, -68.2632, -25.2858] },
  coquimboRegion,
  { code: 'CL-VS', label: 'Valparaíso', bounds: [-71.8432, -33.9559, -69.9893, -32.0207] },
  { code: 'CL-RM', label: 'Metropolitana de Santiago', bounds: [-71.7145, -34.2907, -69.7698, -32.9224] },
  { code: 'CL-LI', label: 'Libertador General Bernardo O’Higgins', bounds: [-72.0563, -35.0053, -70.0092, -33.8506] },
  { code: 'CL-ML', label: 'Maule', bounds: [-72.786, -36.5433, -70.3117, -34.6846] },
  { code: 'CL-NB', label: 'Ñuble', bounds: [-72.8841, -37.1976, -71.0073, -36.0056] },
  { code: 'CL-BI', label: 'Biobío', bounds: [-73.9615, -38.4923, -70.9832, -36.4432] },
  { code: 'CL-AR', label: 'La Araucanía', bounds: [-73.5191, -39.6372, -70.8273, -37.5817] },
  { code: 'CL-LR', label: 'Los Ríos', bounds: [-73.725, -40.6812, -71.592, -39.2878] },
  { code: 'CL-LL', label: 'Los Lagos', bounds: [-74.8465, -44.0671, -71.581, -40.2365] },
  {
    code: 'CL-AI',
    label: 'Aysén del General Carlos Ibáñez del Campo',
    bounds: [-75.6548, -49.2117, -71.0916, -43.6381]
  },
  { code: 'CL-MA', label: 'Magallanes y de la Antártica Chilena', bounds: [-75.7216, -55.9801, -66.4182, -48.5956] },
  {
    code: 'CL-VS-RN-JF',
    label: 'Rapa Nui e Islas Juan Fernández',
    bounds: [-109.4549, -33.8161, -78.7691, -27.0546]
  }
]
