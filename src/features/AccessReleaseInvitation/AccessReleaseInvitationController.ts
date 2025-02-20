import { NextFunction, Request, Response, Router } from 'express'

import { Controller } from '../../core/Controller'
import { ModelAction } from '../../core/interfaces/Model'
import Rules from '../../core/Rules'
import { permissionAuthMiddleware } from '../../middlewares/permissionAuth'
import { Permission } from '../../models/AccessGroup/AccessGroupModel'
import { AccessReleaseInvitationModel } from '../../models/AccessReleaseInvitation/AccessReleaseInvitationModel'
import { AccessReleaseInvitationRepositoryImp } from '../../models/AccessReleaseInvitation/AccessReleaseInvitationMongoDB'
import { DateUtils } from '../../utils/Date'
import { AccessReleaseInvitationRules } from './AccessReleaseInvitationRules'
import { AccessReleaseInvitationService } from './AccessReleaseInvitationService'

export const AccessReleaseInvitationServiceImp = new AccessReleaseInvitationService(AccessReleaseInvitationRepositoryImp)

class AccessReleaseInvitationController extends Controller {
  protected rules: Rules = new AccessReleaseInvitationRules()

  handle (): Router {
    this.router.get(
      '/',
      permissionAuthMiddleware(Permission.read),
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const { tenantId } = request

          const filters = AccessReleaseInvitationModel.listFilters({
            tenantId,
            ...request.query
          })

          const accessReleaseInvitations = await AccessReleaseInvitationServiceImp.list(filters)

          response.OK('Convites encontrados com sucesso!', {
            accessReleaseInvitations
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
            observation,
            groupId,
            initDate,
            endDate,
            areaId
          } = request.body

          this.rules.validate(
            { observation, isRequiredField: false },
            { groupId, isRequiredField: false },
            { initDate },
            { endDate },
            { areaId }
          )

          const accessReleaseInvitationModel = new AccessReleaseInvitationModel({
            actions: [{
              action: ModelAction.create,
              date: DateUtils.getCurrent(),
              userId
            }],
            tenantId,
            observation,
            groupId,
            initDate,
            endDate,
            areaId
          })

          const accessReleaseInvitation = await AccessReleaseInvitationServiceImp.create(accessReleaseInvitationModel)

          response.CREATED('Convite cadastrado com sucesso!', {
            accessReleaseInvitation: accessReleaseInvitation.show
          })
        } catch (error) {
          next(error)
        }
      })

    return this.router
  }
}

const accessReleaseInvitationController = new AccessReleaseInvitationController()
export default accessReleaseInvitationController.handle()
