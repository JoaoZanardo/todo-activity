import { NextFunction, Request, Response, Router } from 'express'

import { Controller } from '../../core/Controller'
import { ModelAction } from '../../core/interfaces/Model'
import Rules from '../../core/Rules'
import { AccessReleaseInvitationGroupModel } from '../../models/AccessReleaseInvitationGroup/AccessReleaseInvitationGroupModel'
import { AccessReleaseInvitationGroupRepositoryImp } from '../../models/AccessReleaseInvitationGroup/AccessReleaseInvitationGroupMongoDB'
import { DateUtils } from '../../utils/Date'
import ObjectId from '../../utils/ObjectId'
import { AccessReleaseInvitationGroupRules } from './AccessReleaseInvitationGroupRules'
import { AccessReleaseInvitationGroupService } from './AccessReleaseInvitationGroupService'

export const AccessReleaseInvitationGroupServiceImp = new AccessReleaseInvitationGroupService(AccessReleaseInvitationGroupRepositoryImp)

class AccessReleaseInvitationGroupController extends Controller {
  protected rules: Rules = new AccessReleaseInvitationGroupRules()

  handle (): Router {
    this.router.get('/', async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tenantId, personId } = request

        const filters = AccessReleaseInvitationGroupModel.listFilters({
          tenantId,
          personId,
          ...request.query
        })

        const accessReleaseInvitationGroups = await AccessReleaseInvitationGroupServiceImp.list(filters)

        response.OK('Grupos de convites encontrados com sucesso!', {
          accessReleaseInvitationGroups
        })
      } catch (error) {
        next(error)
      }
    })

    this.router.post('/', async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tenantId, userId, personId } = request

        const {
          areaId,
          endDate,
          initDate,
          title,
          description
        } = request.body

        this.rules.validate(
          { description, isRequiredField: false },
          { areaId },
          { endDate },
          { initDate },
          { title },
          { initDate },
          { endDate },
          { areaId }
        )

        const accessReleaseInvitationGroupModel = new AccessReleaseInvitationGroupModel({
          actions: [{
            action: ModelAction.create,
            date: DateUtils.getCurrent(),
            userId
          }],
          tenantId,
          areaId,
          endDate,
          initDate,
          personId,
          title,
          description
        })

        const accessReleaseInvitationGroup = await AccessReleaseInvitationGroupServiceImp.create(accessReleaseInvitationGroupModel)

        response.CREATED('Grupo de convite cadastrado com sucesso!', {
          accessReleaseInvitationGroup: accessReleaseInvitationGroup.show
        })
      } catch (error) {
        next(error)
      }
    })

    this.router.delete('/:accessReleaseInvitationGroupId', async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tenantId, userId } = request

        const {
          accessReleaseInvitationGroupId
        } = request.params

        this.rules.validate(
          { accessReleaseInvitationGroupId }
        )

        await AccessReleaseInvitationGroupServiceImp.delete({
          id: ObjectId(accessReleaseInvitationGroupId),
          tenantId,
          responsibleId: userId
        })

        response.OK('Grupo de convite removido com sucesso!')
      } catch (error) {
        next(error)
      }
    })

    return this.router
  }
}

const accessReleaseInvitationGroupController = new AccessReleaseInvitationGroupController()
export default accessReleaseInvitationGroupController.handle()
