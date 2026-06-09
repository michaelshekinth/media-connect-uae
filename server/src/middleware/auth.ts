import type { NextFunction, Request, Response } from 'express'
import { verifyToken, type TokenRole } from '../utils/jwt.js'

export interface AuthRequest extends Request {
  auth?: { sub: string; email: string; role: TokenRole; agencyId?: string }
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  try {
    req.auth = verifyToken(header.slice(7))
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

export function requireRole(...roles: TokenRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    next()
  }
}
