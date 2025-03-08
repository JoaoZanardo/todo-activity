import { NextFunction, Request, Response, Router } from 'express'

import database from '../../config/database'
import { Controller } from '../../core/Controller'
import Rules from '../../core/Rules'
import { AccessControlModel, AccessControlReleaseType } from '../../models/AccessControl/AccessControlModel'
import { AccessControlRepositoryImp } from '../../models/AccessControl/AccessControlMongoDB'
import ObjectId from '../../utils/ObjectId'
import AccessControlCreationService from './AccessControlCreationService'
import { AccessControlRules } from './AccessControlRules'
import { AccessControlService } from './AccessControlService'

export const AccessControlServiceImp = new AccessControlService(AccessControlRepositoryImp)

class AccessControlController extends Controller {
  protected rules: Rules = new AccessControlRules()

  handle (): Router {
    this.router.get(
      '/',
      // permissionAuthMiddleware(Permission.read),
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const { tenantId } = request

          const filters = AccessControlModel.listFilters({
            tenantId,
            ...request.query
          })

          const accessControls = await AccessControlServiceImp.list(filters)

          response.OK('Controle de acessos encontrados com sucesso!', {
            accessControls
          })
        } catch (error) {
          next(error)
        }
      })

    this.router.post(
      '/',
      // permissionAuthMiddleware(Permission.create),
      async (request: Request, response: Response, next: NextFunction) => {
        const session = await database.startSession()
        session.startTransaction()

        try {
          const { tenantId, userId } = request

          const {
            personId,
            accessPointId,
            picture,
            accessReleaseId,
            observation
          } = request.body

          this.rules.validate(
            { accessPointId, isRequiredField: false },
            { picture, isRequiredField: false },
            { observation, isRequiredField: false },
            { personId },
            { accessReleaseId }
          )

          const accessControl = await AccessControlCreationService.execute({
            personId: ObjectId(personId),
            accessPointId: ObjectId(accessPointId),
            tenantId: ObjectId(tenantId),
            userId: ObjectId(userId),
            observation,
            session,
            releaseType: AccessControlReleaseType.manual
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

    return this.router
  }
}

const accessControlController = new AccessControlController()
export default accessControlController.handle()
