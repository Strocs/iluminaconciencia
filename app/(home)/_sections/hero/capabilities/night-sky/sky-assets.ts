import { SKY_REFERENCE } from './sky-reference'

export const nightSkyAssets = {
  photo1x: '/images/hero/sky/t16-left-r1/background-1x.webp',
  photo2x: '/images/hero/sky/t16-left-r1/background-2x.webp',
  // Inline the tiny preview so the first paint needs no extra image request; runtime uses this data URL.
  photoPreview: 'data:image/webp;base64,UklGRiYCAABXRUJQVlA4IBoCAACwGgCdASpAAbQAPyWSv1k/u66lJhiIw/AkiWlu3T53HV8LwgAJIUhHLTk0L6GK5SFpULd3vRL2iSQfmjzhnf73bTXgipBKPPApxgiHgr4cIhDXbuHsmKSjpJbtslZ67JTnZUt31S9bDF8oZ4o9TO4cwsGqr1jlWhnihbRV09iMQqPxeqrg2b14dC6kKfp9dhmppL7oTRHENHOGPsTJdYysJkqiugta4hH3gAH8hJ0E02f6Dz/kzueSJm6kWaFTUlx/zkOXAbHjNPf9qSX305Q7KaRtHBzAv0CqLE0NLAAA/u9OHuke4khrnk8Xtpv0Dgn6hMWQblJXwjx3cIyeB7lemdmSmrAksqFIbVnZBkTiFOm8TNcsHr/IXV6VdY0UcwoqDIAEEpYcB6AqLhkL4iUo/MtObV/0itGJqDqBHMM5Qno5uOJ3Wu0UzmZhWhMc3hg0tDIpnDdJmGzrx8SJfzoph+FsywX/S/ibmjKxpec1zNfRuQ/+cn7h10y/Suux+y9w+ieOPP+3sZqI3cSaYXkn34+5ut8ju1w1AwEaEKkcT2LKVTMdd7sX+DbjckP7xGW9oIzew4W6ox1ojY7FQ+KZMfaT6M/sNxtdG55WJ9i2gBikc05d1vlZd+JDrlwoFNRObnZi86ZVgtQMYPEhSLfovKNttWcqnQSa1LbHIcl+bM6TunYUL+AJyFyMr1SvzoSIq8NNcgj6AAAA',
  catalogStars: '/images/hero/sky/catalog-gt-2px-r1/catalog-stars.svg',
  width: 1920,
  height: 1080,
  bounds: SKY_REFERENCE
} as const
