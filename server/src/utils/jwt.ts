import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export type TokenRole = 'advertiser' | 'media_owner' | 'super_admin'

export interface TokenPayload {
  sub: string
  email: string
  role: TokenRole
  agencyId?: string
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: '7d' })
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, env.jwtSecret) as TokenPayload
}
