import { NextFunction, Request, Response, Router } from 'express'

import database from '../config/database'
import { AccessControlServiceImp } from '../features/AccessControl/AccessControlController'
import UserAuthenticationController from '../features/User/Authentication/UserAuthenticationController'
import ObjectId from '../utils/ObjectId'

class UnauthRouter {
  private unauthRouter = Router()

  route (): Router {
    this.unauthRouter.use('/', UserAuthenticationController)
    this.unauthRouter.post(
      '/access-controls/equipment',
      // permissionAuthMiddleware(Permission.create),
      async (request: Request, response: Response, next: NextFunction) => {
        const session = await database.startSession()
        session.startTransaction()

        try {
          const { tenantId } = request

          const {
            equipmentIp,
            personId
          } = request.body

          const accessControl = await AccessControlServiceImp.createByEquipmentIp({
            equipmentIp,
            personId: ObjectId(personId),
            tenantId
          })

          await session.commitTransaction()
          session.endSession()

          response.CREATED('Controle de acesso cadastrado com sucesso!', {
            accessControl: accessControl.show
          })
        } catch (error) {
          session.endSession()

          next(error)
        }
      })

    return this.unauthRouter
  }
}

const unauthRouter = new UnauthRouter()
export default unauthRouter.route()
