import dotenv from 'dotenv'

dotenv.config()

const getEnvSafe = (env: string) => {
  const value = process.env[env]

  if (!value) {
    // eslint-disable-next-line no-console
    console.error(`Missing environment variable: ${env}`)
    process.exit(1)
  }

  return value
}

export const env = {
  MONGODB_URI: getEnvSafe('MONGODB_URI'),
  FRONTEND_URL: getEnvSafe('FRONTEND_URL'),
  SESSION_SECRET: getEnvSafe('SESSION_SECRET'),
  NODE_ENV: getEnvSafe('NODE_ENV'),
  GOOGLE_CLIENT_ID: getEnvSafe('GOOGLE_CLIENT_ID'),
  GOOGLE_CLIENT_SECRET: getEnvSafe('GOOGLE_CLIENT_SECRET'),
  GOOGLE_CALLBACK_URL: getEnvSafe('GOOGLE_CALLBACK_URL'),
  PORT: getEnvSafe('PORT'),
}
