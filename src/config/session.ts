import session from 'express-session'
import MongoStore from 'connect-mongo'
import { csrfSync } from 'csrf-sync'

import { env } from './env.ts'

export const { csrfSynchronisedProtection, generateToken, revokeToken } =
  csrfSync()

export const sessionMiddleware = session({
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: env.MONGODB_URI,
    ttl: 14 * 24 * 60 * 60, // 14 days
    touchAfter: 24 * 60 * 60, // 1 day
  }),
  cookie: {
    secure: env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
  },
})
