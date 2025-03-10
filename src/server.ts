/* eslint-disable no-useless-constructor */
import cors from 'cors'
import express, { Application } from 'express'
import { IncomingMessage, Server as HTTPServer, ServerResponse } from 'http'
import morgan from 'morgan'

import executeJobs from './jobs'
import router from './routes/router'

export class Server {
  private _server?: HTTPServer<typeof IncomingMessage, typeof ServerResponse>
  private connections: Set<any> = new Set()

  constructor (
    private _app: Application,
    private port: number = 8000
  ) {}

  async init (): Promise<void> {
    executeJobs()

    this.setupApp()
    this.setupRoutes()
  }

  private setupRoutes (): void {
    this._app.use(router)
  }

  private setupApp (): void {
    this._app.use(
      morgan(':method :url :status :res[content-length] - :response-time ms')
    )
    this._app.use(cors({}))
    this._app.use(express.json())
  }

  get app (): Application {
    return this._app
  }

  start (): void {
    this._server = this._app.listen(this.port, () => {
      console.log(`Server running at: ${this.port}`)
    })

    this._server.on('connection', (conn) => {
      this.connections.add(conn)

      conn.on('close', () => {
        this.connections.delete(conn)
      })
    })
  }

  public async close (): Promise<void> {
    if (!this._server) return

    console.log('Closing server...')
    for (const conn of this.connections) {
      conn.destroy()
    }

    await new Promise<void>((resolve, reject) => {
      this._server?.close((err) => {
        if (err) {
          console.error('Error closing server:', err)
          reject(err)
        } else {
          console.log('Server stopped')
          resolve()
        }
      })
    })
  }
}
