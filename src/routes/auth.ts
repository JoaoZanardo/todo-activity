import { Request, Response, Router } from 'express'

import AccessGroupController from '../features/AccessGroup/AccessGroupController'
import PersonController from '../features/Person/PersonController'
import PersonTypeController from '../features/PersonType/PersonTypeController'
import PersonTypeCategoryController from '../features/PersonTypeCategory/PersonTypeCategoryController'
import PersonTypeFormController from '../features/PersonTypeForm/PersonTypeFormController'
import UserController from '../features/User/UserController'
import WorkScheduleController from '../features/WorkSchedule/WorkScheduleController'
import { moduleAuthMiddleware } from '../middlewares/moduleAuth'
import { userAuthMiddleware } from '../middlewares/userAuth'

class AuthRouter {
  private authRouter = Router()

  route (): Router {
    this.authRouter.use(userAuthMiddleware)

    this.authRouter.use('/profile', (request: Request, response: Response) => {
      const { user } = request

      response.OK('Usuário encontrado com sucesso!', {
        user
      })
    })

    this.authRouter.use('/access-groups', moduleAuthMiddleware('A-02'), AccessGroupController)
    this.authRouter.use('/users', moduleAuthMiddleware('D-01'), UserController)
    this.authRouter.use('/person-types', moduleAuthMiddleware('B-02'), PersonTypeController)
    this.authRouter.use('/person-type-categories', moduleAuthMiddleware('B-02'), PersonTypeCategoryController)
    this.authRouter.use('/person-type-forms', moduleAuthMiddleware('B-02'), PersonTypeFormController)
    this.authRouter.use('/people', moduleAuthMiddleware('B-01'), PersonController)
    this.authRouter.use('/work-schedules', moduleAuthMiddleware('B-04'), WorkScheduleController)

    return this.authRouter
  }
}

const authRouter = new AuthRouter()
export default authRouter.route()
