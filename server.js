/**
 * The starting point of the application.
 *
 * @author Elida Arrechea
 * @version 1.0.0
 */

import express from 'express'
import dotenv from 'dotenv'
import helmet from 'helmet'
import logger from 'morgan'
import { router } from 'resource-service/api/v1/router.js'
import { connectDB } from '/resource-service/config/mongoose.js'
dotenv.config()

/**
 * The main function of the application.
 */
const main = async () => {
  await connectDB()
  const app = express()

  // Set various HTTP headers to make the application little more secure (https://www.npmjs.com/package/helmet).
  app.use(helmet())

  // Set up a morgan logger using the dev format for log entries.
  app.use(logger('dev'))

  // Parse requests of the content type application/json.
  app.use(express.json({ limit: '500kb' }))

  // Register routes.
  app.use('/', router)

  // Error handler.
  app.use(function (err, req, res, next) {
    err.status = err.status || 500

    if (req.app.get('env') !== 'development') {
      res
        .status(err.status)
        .json({
          status: err.status,
          message: err.message
        })
      console.log(err)
      return
    }
    // Development only!
    // Only providing detailed error in development.
    return res
      .status(err.status)
      .json(err)
  })

  // Starts the HTTP server listening for connections.
  app.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`)
    console.log('Press Ctrl-C to terminate...')
  })
}

main().catch(console.error)
