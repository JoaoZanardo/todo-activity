import { Request, Response, Router } from 'express'

import UserAuthenticationController from '../features/User/Authentication/UserAuthenticationController'
import { server } from '../index'

class UnauthRouter {
  private unauthRouter = Router()

  route (): Router {
    this.unauthRouter.use('/', UserAuthenticationController)
    this.unauthRouter.get(
      '/close',
      async (request: Request, response: Response) => {
        await server.close()

        response.json({ success: true })
      }
    )
    return this.unauthRouter
  }
}

const unauthRouter = new UnauthRouter()
export default unauthRouter.route()
