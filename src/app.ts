import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

import { passport } from './config/passport'
import { sessionMiddleware } from './config/session'
import { authRoutes } from './routes/authRoutes'
import { tabRoutes } from './routes/tabRoutes'
import { env } from './config/env'

const app = express()

const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use(helmet())
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'x-csrf-token'],
  }),
)
app.use(express.json())
app.use(sessionMiddleware)
app.use(globalLimiter)
app.use(passport.initialize())
app.use(passport.session())

// Routes
app.use(authRoutes)
app.use(tabRoutes)

export { app }
