import mongoose from 'mongoose'

import { env } from './env'

export const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI)
    // eslint-disable-next-line no-console
    console.log('MongoDB connected')
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('MongoDB error:', err)
    process.exit(1)
  }
}
