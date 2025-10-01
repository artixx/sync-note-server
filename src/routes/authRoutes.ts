import express from 'express'
import { NextFunction, Request, Response } from 'express'

import { passport } from '../config/passport.ts'
import {
  csrfSynchronisedProtection,
  generateToken,
  revokeToken,
} from '../config/session'
import { requireAuth } from '../middlewares/auth.ts'
import { User } from '../models/User.ts'
import { env } from '../config/env'

const authRoutes = express.Router()

const logout = (req: Request, res: Response, next: NextFunction) => {
  revokeToken(req)
  req.logout((err) => {
    if (err) return next(err)
  })
  res.json({ success: true, message: 'Logged out successfully' })
}

const getAuthInfo = async (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    const user = await User.findById(req.user.id)

    if (user) {
      const csrfToken = generateToken(req)
      res.json({
        isAuthenticated: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        csrfToken,
      })
    } else {
      req.logout((err) => {
        // eslint-disable-next-line no-console
        if (err) console.error(err)
      })
      res.json({ isAuthenticated: false, user: null, csrfToken: null })
    }
  } else {
    res.json({ isAuthenticated: false, user: null, csrfToken: null })
  }
}

authRoutes.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
)

authRoutes.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: env.FRONTEND_URL,
  }),
  (_req, res) => {
    res.redirect(env.FRONTEND_URL)
  },
)

authRoutes.post(
  '/api/auth/logout',
  requireAuth,
  csrfSynchronisedProtection,
  logout,
)

authRoutes.get('/api/auth/user', getAuthInfo)

export { authRoutes }
