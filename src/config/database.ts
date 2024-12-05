import mongoose, { Connection } from 'mongoose'

import env from './env'

export class MongoDB {
  private uri = env.mongoUrl

  connect (): Connection {
    const connection = mongoose.createConnection(this.uri)
    if (!connection) throw Error()

    return connection
  }
}

const database = new MongoDB()

export default database.connect()
