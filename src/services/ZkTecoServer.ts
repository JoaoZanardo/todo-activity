import env from '../config/env'

class ZkTecoServer {
  private baseUrl: string

  constructor (baseUrl: string = env.zkTecoServerUrl) {
    this.baseUrl = baseUrl
  }

  async addAccess (): Promise<void> { }
}

export default new ZkTecoServer()
