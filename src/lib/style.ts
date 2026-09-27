import type { CSSProperties } from 'react'

/** Stagger index for intro/reveal transitions (read by CSS as `--d`). */
export const stagger = (n: number) => ({ '--d': n }) as CSSProperties
