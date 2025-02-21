import { NextFunction, Request, Response, Router } from 'express'

import database from '../config/database'
import { ModelAction } from '../core/interfaces/Model'
import { AccessControlServiceImp } from '../features/AccessControl/AccessControlController'
import { AccessReleaseInvitationServiceImp } from '../features/AccessReleaseInvitation/AccessReleaseInvitationController'
import { PersonServiceImp } from '../features/Person/PersonController'
import UserAuthenticationController from '../features/User/Authentication/UserAuthenticationController'
import { AccessReleaseModel, AccessReleaseStatus, AccessReleaseType } from '../models/AccessRelease/AccessReleaseModel'
import { AccessReleaseRepositoryImp } from '../models/AccessRelease/AccessReleaseMongoDB'
import { PersonCreationType, PersonModel } from '../models/Person/PersonModel'
import { DateUtils } from '../utils/Date'
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

    this.unauthRouter.get('/access-release-invitations/:accessReleaseInvitationId', async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tenantId } = request

        const {
          accessReleaseInvitationId
        } = request.params

        const accessReleaseInvitation = await AccessReleaseInvitationServiceImp.findById({
          id: ObjectId(accessReleaseInvitationId),
          tenantId
        })

        response.OK('Convite encontrado com sucesso!', {
          accessReleaseInvitation: accessReleaseInvitation.show
        })
      } catch (error) {
        next(error)
      }
    })

    this.unauthRouter.post('/people', async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tenantId } = request

        const {
          phone,
          name,
          personTypeId,
          responsibleId,
          cpf,
          picture
        } = request.body

        const personModel = new PersonModel({
          tenantId,
          actions: [{
            action: ModelAction.create,
            date: DateUtils.getCurrent()
          }],
          personTypeId: ObjectId(personTypeId),
          name,
          phone,
          responsibleId,
          cpf,
          picture,
          creationType: PersonCreationType.invite
        })

        const person = await PersonServiceImp.create(personModel)

        response.CREATED('Pessoa cadastrada com sucesso!', {
          person: person.show
        })
      } catch (error) {
        next(error)
      }
    })

    this.unauthRouter.post('/access-releases', async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tenantId, userId } = request

        const {
          personId,
          personTypeId,
          observation,
          responsibleId,
          picture,
          initDate,
          finalAreaId,
          acccessReleseInvitationId,
          endDate
        } = request.body

        const accessReleaseModel = new AccessReleaseModel({
          responsibleId,
          observation,
          tenantId,
          picture,
          actions: [{
            action: ModelAction.create,
            date: DateUtils.getCurrent(),
            userId
          }],
          personId,
          personTypeId,
          type: AccessReleaseType.invite,
          status: AccessReleaseStatus.scheduled,
          finalAreaId,
          acccessReleseInvitationId,
          initDate: DateUtils.parse(initDate)!,
          endDate: DateUtils.parse(endDate)!
        })

        const accessRelease = await AccessReleaseRepositoryImp.create(accessReleaseModel)

        response.CREATED('Liberação de acesso cadastrada com sucesso!', {
          accessRelease: accessRelease.show
        })
      } catch (error) {
        next(error)
      }
    })

    return this.unauthRouter
  }
}

const unauthRouter = new UnauthRouter()
export default unauthRouter.route()
