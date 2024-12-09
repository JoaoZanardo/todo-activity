import { Router } from 'express'

import UserAuthenticationController from '../features/User/Authentication/UserAuthenticationController'

class UnauthRouter {
  private unauthRouter = Router()

  route (): Router {
    this.unauthRouter.use('/', UserAuthenticationController)

    return this.unauthRouter
  }
}

const unauthRouter = new UnauthRouter()
export default unauthRouter.route()
