import { NextFunction, Request, Response, Router } from 'express'

import database from '../../config/database'
import { Controller } from '../../core/Controller'
import { ModelAction } from '../../core/interfaces/Model'
import Rules from '../../core/Rules'
import { AccessControlModel } from '../../models/AccessControl/AccessControlModel'
import { AccessControlRepositoryImp } from '../../models/AccessControl/AccessControlMongoDB'
import { DateUtils } from '../../utils/Date'
import ObjectId from '../../utils/ObjectId'
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
            personTypeId,
            type,
            accessPointId,
            picture,
            accessReleaseId
          } = request.body

          this.rules.validate(
            { accessPointId, isRequiredField: false },
            { picture, isRequiredField: false },
            { personId },
            { personTypeId },
            { type },
            { accessReleaseId }
          )

          const accessControlModel = new AccessControlModel({
            accessPointId,
            tenantId,
            picture,
            actions: [{
              action: ModelAction.create,
              date: DateUtils.getCurrent(),
              userId
            }],
            personId,
            personTypeId,
            type,
            accessReleaseId
          })

          const accessControl = await AccessControlServiceImp.create(accessControlModel)

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

    this.router.post(
      '/equipment',
      // permissionAuthMiddleware(Permission.create),
      async (request: Request, response: Response, next: NextFunction) => {
        const session = await database.startSession()
        session.startTransaction()

        try {
          const { tenantId } = request

          const {
            equipmentId,
            personId
          } = request.body

          this.rules.validate(
            { equipmentId },
            { personId }
          )

          const accessControl = await AccessControlServiceImp.createByEquipmentId({
            equipmentId: ObjectId(equipmentId),
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

    return this.router
  }
}

const accessControlController = new AccessControlController()
export default accessControlController.handle()
