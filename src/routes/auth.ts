import { Router } from 'express'

import PersonController from '../features/Person/PersonController'
import UserController from '../features/User/UserController'
import { userAuthMiddleware } from '../middlewares/userAuth'

class AuthRouter {
  private authRouter = Router()

  route (): Router {
    this.authRouter.use(userAuthMiddleware)

    this.authRouter.use('/users', UserController)
    this.authRouter.use('/people', PersonController)

    return this.authRouter
  }
}

const authRouter = new AuthRouter()
export default authRouter.route()
