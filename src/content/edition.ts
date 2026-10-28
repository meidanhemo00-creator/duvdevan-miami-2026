import { editions, type Edition } from './editions'

/** The edition this build is for: VITE_EDITION (default la). See editions.ts. */
const key: string = import.meta.env.VITE_EDITION || 'la'

if (!(key in editions)) throw new Error('Unknown VITE_EDITION: ' + key)

export const edition: Edition = editions[key]
