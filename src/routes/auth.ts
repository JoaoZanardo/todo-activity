import { Router } from 'express'

import AccessGroupController from '../features/AccessGroup/AccessGroupController'
import PersonController from '../features/Person/PersonController'
import UserController from '../features/User/UserController'
import { moduleAuthMiddleware } from '../middlewares/moduleAuth'
import { userAuthMiddleware } from '../middlewares/userAuth'

class AuthRouter {
  private authRouter = Router()

  route (): Router {
    this.authRouter.use(userAuthMiddleware)

    this.authRouter.use('/users', moduleAuthMiddleware('01'), UserController)
    this.authRouter.use('/people', moduleAuthMiddleware('02'), PersonController)
    this.authRouter.use('/access-groups', moduleAuthMiddleware('03'), AccessGroupController)

    return this.authRouter
  }
}

const authRouter = new AuthRouter()
export default authRouter.route()
