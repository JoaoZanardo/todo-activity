import { NextFunction, Request, Response, Router } from 'express'

import multer from '../config/multer'
import AccessAreaController from '../features/AccessArea/AccessAreaController'
import AccessControlController from '../features/AccessControl/AccessControlController'
import AccessGroupController from '../features/AccessGroup/AccessGroupController'
import AccessPointController from '../features/AccessPoint/AccessPointController'
import AccessReleaseController from '../features/AccessRelease/AccessReleaseController'
import AccessSynchronizationController from '../features/AccessSynchronization/AccessSynchronizationController'
import AreaController from '../features/Area/AreaController'
import EquipmentController from '../features/Equipment/EquipmentController'
import PersonController from '../features/Person/PersonController'
import PersonTypeController from '../features/PersonType/PersonTypeController'
import PersonTypeCategoryController from '../features/PersonTypeCategory/PersonTypeCategoryController'
import PersonTypeFormController from '../features/PersonTypeForm/PersonTypeFormController'
import UserController from '../features/User/UserController'
import WorkScheduleController from '../features/WorkSchedule/WorkScheduleController'
import { moduleAuthMiddleware } from '../middlewares/moduleAuth'
import { S3Middleware } from '../middlewares/S3'
import { userAuthMiddleware } from '../middlewares/userAuth'

class AuthRouter {
  private authRouter = Router()

  route (): Router {
    this.authRouter.use(userAuthMiddleware)

    this.authRouter.post('/upload',
      multer.single('image'),
      S3Middleware,
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          response.OK('Arquivo gravado com sucesso!', {
            file: request.filePath
          })
        } catch (error) {
          next(error)
        }
      })

    this.authRouter.use('/profile', (request: Request, response: Response) => {
      const { user } = request

      response.OK('Usuário encontrado com sucesso!', {
        user
      })
    })

    this.authRouter.use('/access-controls', moduleAuthMiddleware('A-02'), AccessControlController)
    this.authRouter.use('/access-releases', moduleAuthMiddleware('A-02'), AccessReleaseController)
    this.authRouter.use('/people', moduleAuthMiddleware('B-01'), PersonController)
    this.authRouter.use('/person-type-forms', moduleAuthMiddleware('B-02'), PersonTypeFormController)
    this.authRouter.use('/person-types', moduleAuthMiddleware('B-02'), PersonTypeController)
    this.authRouter.use('/person-type-categories', moduleAuthMiddleware('B-02'), PersonTypeCategoryController)
    this.authRouter.use('/work-schedules', moduleAuthMiddleware('B-04'), WorkScheduleController)
    this.authRouter.use('/equipments', moduleAuthMiddleware('C-01'), EquipmentController)
    this.authRouter.use('/access-synchronizations', moduleAuthMiddleware('C-01'), AccessSynchronizationController)
    this.authRouter.use('/access-areas', moduleAuthMiddleware('C-02'), AccessAreaController)
    this.authRouter.use('/access-points', moduleAuthMiddleware('C-02'), AccessPointController)
    this.authRouter.use('/areas', moduleAuthMiddleware('C-02'), AreaController)
    this.authRouter.use('/users', moduleAuthMiddleware('D-01'), UserController)
    this.authRouter.use('/access-groups', moduleAuthMiddleware('D-02'), AccessGroupController)

    return this.authRouter
  }
}

const authRouter = new AuthRouter()
export default authRouter.route()
