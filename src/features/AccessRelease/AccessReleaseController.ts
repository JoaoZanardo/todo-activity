import { NextFunction, Request, Response, Router } from 'express'

import database from '../../config/database'
import { Controller } from '../../core/Controller'
import { ModelAction } from '../../core/interfaces/Model'
import Rules from '../../core/Rules'
import { permissionAuthMiddleware } from '../../middlewares/permissionAuth'
import { Permission } from '../../models/AccessGroup/AccessGroupModel'
import { AccessReleaseModel, AccessReleaseStatus } from '../../models/AccessRelease/AccessReleaseModel'
import { AccessReleaseRepositoryImp } from '../../models/AccessRelease/AccessReleaseMongoDB'
import { DateUtils } from '../../utils/Date'
import ObjectId from '../../utils/ObjectId'
import AccessReleaseCreationService from './AccessReleaseCreationService'
import { AccessReleaseRules } from './AccessReleaseRules'
import { AccessReleaseService } from './AccessReleaseService'

export const AccessReleaseServiceImp = new AccessReleaseService(AccessReleaseRepositoryImp)

class AccessReleaseController extends Controller {
  protected rules: Rules = new AccessReleaseRules()

  handle (): Router {
    this.router.get(
      '/',
      permissionAuthMiddleware(Permission.read),
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const { tenantId } = request

          const filters = AccessReleaseModel.listFilters({
            tenantId,
            ...request.query
          })

          const accessReleases = await AccessReleaseServiceImp.list(filters)

          response.OK('Liberações de acessos encontradas com sucesso!', {
            accessReleases
          })
        } catch (error) {
          next(error)
        }
      })

    this.router.get(
      '/person/:personId/last',
      permissionAuthMiddleware(Permission.read),
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const { tenantId } = request

          const { personId } = request.params

          const accessRelease = await AccessReleaseServiceImp.findLastByPersonId({
            personId: ObjectId(personId),
            tenantId
          })

          response.OK('Liberação de acesso encontrada com sucesso!', {
            accessRelease: accessRelease?.show
          })
        } catch (error) {
          next(error)
        }
      })

    this.router.post(
      '/',
      permissionAuthMiddleware(Permission.create),
      async (request: Request, response: Response, next: NextFunction) => {
        const session = await database.startSession()
        session.startTransaction()

        try {
          const { tenantId, userId } = request

          const {
            personId,
            personTypeId,
            type,
            observation,
            responsibleId,
            accessPointId,
            areasIds,
            picture,
            expiringTime,
            singleAccess,
            personTypeCategoryId,
            initDate,
            finalAreaId,
            active,
            noticeId,
            workSchedulesCodes,
            accessReleaseInvitationId
          } = request.body

          this.rules.validate(
            { responsibleId, isRequiredField: false },
            { observation, isRequiredField: false },
            { accessPointId, isRequiredField: false },
            { areasIds, isRequiredField: false },
            { picture, isRequiredField: false },
            { expiringTime, isRequiredField: false },
            { singleAccess, isRequiredField: false },
            { personTypeCategoryId, isRequiredField: false },
            { initDate, isRequiredField: false },
            { active, isRequiredField: false },
            { noticeId, isRequiredField: false },
            { workSchedulesCodes, isRequiredField: false },
            { accessReleaseInvitationId, isRequiredField: false },
            { personId },
            { personTypeId },
            { type },
            { areaId: finalAreaId }
          )

          const accessReleaseModel = new AccessReleaseModel({
            expiringTime,
            singleAccess,
            accessPointId,
            areasIds,
            responsibleId,
            observation,
            active,
            tenantId,
            picture,
            personTypeCategoryId,
            actions: [{
              action: ModelAction.create,
              date: DateUtils.getCurrent(),
              userId
            }],
            personId,
            personTypeId,
            type,
            finalAreaId,
            noticeId,
            workSchedulesCodes,
            accessReleaseInvitationId,
            initDate: initDate ? DateUtils.parse(initDate) ?? undefined : undefined
          })

          const accessRelease = await AccessReleaseCreationService.execute(accessReleaseModel, session)

          response.CREATED('Liberação de acesso cadastrada com sucesso!', {
            accessRelease: accessRelease.show
          })
        } catch (error) {
          session.endSession()

          next(error)
        }
      })

    this.router.get(
      '/:accessReleaseId/disable',
      permissionAuthMiddleware(Permission.delete),
      async (request: Request, response: Response, next: NextFunction) => {
        const session = await database.startSession()
        session.startTransaction()

        try {
          const { tenantId, userId } = request

          const { accessReleaseId } = request.params

          this.rules.validate(
            { accessReleaseId }
          )

          await AccessReleaseServiceImp.disable({
            id: ObjectId(accessReleaseId),
            tenantId,
            responsibleId: userId,
            status: AccessReleaseStatus.disabled,
            session
          })

          await session.commitTransaction()
          session.endSession()

          response.OK('Liberação de acesso desativada com sucesso!')
        } catch (error) {
          session.endSession()

          next(error)
        }
      })

    return this.router
  }
}

const accessReleaseController = new AccessReleaseController()
export default accessReleaseController.handle()
