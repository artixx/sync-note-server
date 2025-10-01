import http from 'http'

import { app } from './app'
import { connectDB } from './config/database'
import { env } from './config/env'

const PORT = env.PORT

;(async () => {
  await connectDB()
  const server = http.createServer(app)
  // eslint-disable-next-line no-console
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})()
