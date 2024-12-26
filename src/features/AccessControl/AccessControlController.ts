import { NextFunction, Request, Response, Router } from 'express'

import { Controller } from '../../core/Controller'
import { ModelAction } from '../../core/interfaces/Model'
import Rules from '../../core/Rules'
import { permissionAuthMiddleware } from '../../middlewares/permissionAuth'
import { AccessControlModel } from '../../models/AccessControl/AccessControlModel'
import { AccessControlRepositoryImp } from '../../models/AccessControl/AccessControlMongoDB'
import { Permission } from '../../models/AccessGroup/AccessGroupModel'
import { DateUtils } from '../../utils/Date'
import { AccessControlRules } from './AccessControlRules'
import { AccessControlService } from './AccessControlService'

export const AccessControlServiceImp = new AccessControlService(AccessControlRepositoryImp)

class AccessControlController extends Controller {
  protected rules: Rules = new AccessControlRules()

  handle (): Router {
    this.router.get(
      '/',
      permissionAuthMiddleware(Permission.read),
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
      permissionAuthMiddleware(Permission.create),
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const { tenantId, userId } = request

          const {
            accessRealese,
            personId,
            personTypeId,
            type,
            observation,
            personTypeCategoryId,
            responsibleId
          } = request.body

          this.rules.validate(
            { personTypeCategoryId, isRequiredField: false },
            { responsibleId, isRequiredField: false },
            { observation, isRequiredField: false },
            { accessRealese },
            { personId },
            { personTypeId },
            { type }
          )

          const accessControlModel = new AccessControlModel({
            personTypeCategoryId,
            responsibleId,
            observation,
            tenantId,
            actions: [{
              action: ModelAction.create,
              date: DateUtils.getCurrent(),
              userId
            }],
            accessRealese,
            personId,
            personTypeId,
            type
          })

          const accessControl = await AccessControlServiceImp.create(accessControlModel)

          response.CREATED('Controle de acesso cadastrado com sucesso!', {
            accessControl: accessControl.show
          })
        } catch (error) {
          next(error)
        }
      })

    return this.router
  }
}

const accessControlController = new AccessControlController()
export default accessControlController.handle()
