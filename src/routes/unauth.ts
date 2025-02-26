import { NextFunction, Request, Response, Router } from 'express'

import database from '../config/database'
import { ModelAction } from '../core/interfaces/Model'
import { AccessControlServiceImp } from '../features/AccessControl/AccessControlController'
import AccessReleaseCreationService from '../features/AccessRelease/AccessReleaseCreationService'
import { PersonServiceImp } from '../features/Person/PersonController'
import UserAuthenticationController from '../features/User/Authentication/UserAuthenticationController'
import { PersonCreationType, PersonModel } from '../models/Person/PersonModel'
import { DateUtils } from '../utils/Date'
import ObjectId from '../utils/ObjectId'

class UnauthRouter {
  private unauthRouter = Router()

  route (): Router {
    this.unauthRouter.use('/', UserAuthenticationController)

    this.unauthRouter.post('/access-controls/equipment', async (request: Request, response: Response, next: NextFunction) => {
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
      const session = await database.startSession()
      session.startTransaction()

      try {
        const { tenantId } = request

        const {
          accessReleaseInvitationId,
          guestId,
          personTypeId,
          picture
        } = request.body

        const accessRelease = await AccessReleaseCreationService.createByAccessReleaseInvitationId({
          accessReleaseInvitationId: ObjectId(accessReleaseInvitationId),
          tenantId,
          guestId: ObjectId(guestId),
          personTypeId: ObjectId(personTypeId),
          picture,
          session
        })

        await session.commitTransaction()
        session.endSession()

        response.CREATED('Liberação de acesso cadastrada com sucesso!', {
          accessRelease: accessRelease.show
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
