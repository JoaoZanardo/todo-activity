import { NextFunction, Request, Response, Router } from 'express'

import { Controller } from '../../core/Controller'
import { ModelAction } from '../../core/interfaces/Model'
import Rules from '../../core/Rules'
import { AccessReleaseInvitationModel } from '../../models/AccessReleaseInvitation/AccessReleaseInvitationModel'
import { AccessReleaseInvitationRepositoryImp } from '../../models/AccessReleaseInvitation/AccessReleaseInvitationMongoDB'
import { DateUtils } from '../../utils/Date'
import ObjectId from '../../utils/ObjectId'
import { AccessReleaseInvitationRules } from './AccessReleaseInvitationRules'
import { AccessReleaseInvitationService } from './AccessReleaseInvitationService'

export const AccessReleaseInvitationServiceImp = new AccessReleaseInvitationService(AccessReleaseInvitationRepositoryImp)

class AccessReleaseInvitationController extends Controller {
  protected rules: Rules = new AccessReleaseInvitationRules()

  handle (): Router {
    this.router.get('/', async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tenantId, personId } = request

        const filters = AccessReleaseInvitationModel.listFilters({
          tenantId,
          personId,
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

    this.router.post('/', async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tenantId, userId, personId } = request

        const {
          observation,
          accessReleaseInvitationGroupId,
          initDate,
          endDate,
          areaId,
          guestName,
          guestPhone,
          guestId
        } = request.body

        this.rules.validate(
          { observation, isRequiredField: false },
          { accessReleaseInvitationGroupId, isRequiredField: false },
          { guestId, isRequiredField: false },
          { guestName, isRequiredField: false },
          { guestPhone, isRequiredField: false },
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
          accessReleaseInvitationGroupId,
          initDate: DateUtils.parse(initDate)!,
          endDate: DateUtils.parse(endDate)!,
          areaId,
          guestId,
          guestName,
          guestPhone,
          personId
        })

        const accessReleaseInvitation = await AccessReleaseInvitationServiceImp.create(accessReleaseInvitationModel)

        response.CREATED('Convite cadastrado com sucesso!', {
          accessReleaseInvitation: accessReleaseInvitation.show
        })
      } catch (error) {
        next(error)
      }
    })

    this.router.delete('/:accessReleaseInvitationId', async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tenantId, userId } = request

        console.log('Delete')

        const {
          accessReleaseInvitationId
        } = request.params

        this.rules.validate(
          { accessReleaseInvitationId }
        )

        await AccessReleaseInvitationServiceImp.delete({
          id: ObjectId(accessReleaseInvitationId),
          tenantId,
          responsibleId: userId
        })

        response.OK('Convite removido com sucesso!')
      } catch (error) {
        next(error)
      }
    })

    return this.router
  }
}

const accessReleaseInvitationController = new AccessReleaseInvitationController()
export default accessReleaseInvitationController.handle()
