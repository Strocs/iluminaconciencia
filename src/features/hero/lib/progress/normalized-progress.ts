import type { NormalizedProgress } from '../contracts/hero-runtime';

const MINIMUM_PROGRESS = 0;
const MAXIMUM_PROGRESS = 1;

export function toNormalizedProgress(value: number): NormalizedProgress {
  if (!Number.isFinite(value)) return MINIMUM_PROGRESS as NormalizedProgress;

  return Math.min(MAXIMUM_PROGRESS, Math.max(MINIMUM_PROGRESS, value)) as NormalizedProgress;
}
