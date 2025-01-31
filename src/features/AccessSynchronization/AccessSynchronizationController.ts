import { NextFunction, Request, Response, Router } from 'express'

import { Controller } from '../../core/Controller'
import { ModelAction } from '../../core/interfaces/Model'
import Rules from '../../core/Rules'
import { permissionAuthMiddleware } from '../../middlewares/permissionAuth'
import { Permission } from '../../models/AccessGroup/AccessGroupModel'
import { AccessSynchronizationModel } from '../../models/AccessSynchronization/AccessSynchronizationModel'
import { AccessSynchronizationRepositoryImp } from '../../models/AccessSynchronization/AccessSynchronizationMongoDB'
import { DateUtils } from '../../utils/Date'
import { AccessSynchronizationRules } from './AccessSynchronizationRules'
import { AccessSynchronizationService } from './AccessSynchronizationService'

export const AccessSynchronizationServiceImp = new AccessSynchronizationService(AccessSynchronizationRepositoryImp)

class AccessSynchronizationController extends Controller {
  protected rules: Rules = new AccessSynchronizationRules()

  handle (): Router {
    this.router.get(
      '/',
      permissionAuthMiddleware(Permission.read),
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const { tenantId } = request

          const filters = AccessSynchronizationModel.listFilters({
            tenantId,
            ...request.query
          })

          const accessSynchronizations = await AccessSynchronizationServiceImp.list(filters)

          response.OK('Sincronizações de acessos encontradas com sucesso!', {
            accessSynchronizations
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
            equipmentId,
            accessPointId,
            personTypesIds
          } = request.body

          this.rules.validate(
            { equipmentId, isRequiredField: false },
            { personTypesIds, isRequiredField: false },
            { accessPointId, isRequiredField: false }
          )

          const accessSynchronizationModel = new AccessSynchronizationModel({
            tenantId,
            actions: [{
              action: ModelAction.create,
              date: DateUtils.getCurrent(),
              userId
            }],
            equipmentId,
            personTypesIds,
            accessPointId
          })

          const accessSynchronization = await AccessSynchronizationServiceImp.create(accessSynchronizationModel)

          response.CREATED('Sincronização de acesso cadastrada com sucesso!', {
            accessSynchronization: accessSynchronization.show
          })
        } catch (error) {
          next(error)
        }
      })

    return this.router
  }
}

const accessSynchronizationController = new AccessSynchronizationController()
export default accessSynchronizationController.handle()
