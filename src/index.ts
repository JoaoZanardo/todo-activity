/* eslint-disable func-call-spacing */
/* eslint-disable no-undef */
import Express from 'express'

import { Server } from './server'

enum ExitStatus {
  Success = 0,
  Failure = 1
}

process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  console.log(`App exiting due to an unhandled promise: ${promise} and reason: ${reason}`)
  throw reason
})

process.on('uncaughtException', (error) => {
  console.log(`App exiting due to an uncaught exception ${error}`)
  process.exit(ExitStatus.Failure)
})

const app = Express()
export const server = new Server(app);

(async () => {
  try {
    await server.init()

    server.start()

    const exitSignals: Array<NodeJS.Signals> = ['SIGINT', 'SIGTERM', 'SIGQUIT']

    exitSignals.map(sig => process.on(sig, async () => {
      try {
        console.log('App exited with success')
        process.exit(ExitStatus.Success)
      } catch (error) {
        console.log(`App exited with error: ${error}`)
        process.exit(ExitStatus.Failure)
      }
    }))
  } catch (error) {
    console.log(`App exited with error: ${error}`)
    process.exit(ExitStatus.Failure)
  }
})()
