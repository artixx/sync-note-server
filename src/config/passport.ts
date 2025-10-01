import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'

import { User } from '../models/User.ts'
import { env } from './env.ts'

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const googleId = profile.id
        const email = profile.emails?.[0].value
        const name = profile.displayName

        const user = await User.findOneAndUpdate(
          { googleId },
          {
            $set: {
              email,
              name,
            },
            $setOnInsert: {
              tabs: [],
            },
          },
          { upsert: true, new: true },
        )

        return done(null, { id: user.id })
      } catch (error) {
        return done(error)
      }
    },
  ),
)

passport.serializeUser(({ id }, done) => done(null, id))

passport.deserializeUser(async (id: string, done) => {
  done(null, { id })
})

export { passport }
