import { NextFunction, Request, Response, Router } from 'express'
import { Types } from 'mongoose'

import database from '../config/database'
import { ModelAction } from '../core/interfaces/Model'
import Rules from '../core/Rules'
import { AccessControlServiceImp } from '../features/AccessControl/AccessControlController'
import AccessReleaseCreationService from '../features/AccessRelease/AccessReleaseCreationService'
import { PersonServiceImp } from '../features/Person/PersonController'
import UserAuthenticationController from '../features/User/Authentication/UserAuthenticationController'
import { PersonCreationType, PersonModel } from '../models/Person/PersonModel'
import PersonTypeMongoDB from '../models/PersonType/PersonTypeMongoDB'
import CustomResponse from '../utils/CustomResponse'
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
          tenantId,
          session
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

    this.unauthRouter.post('/people/access-releases', async (request: Request, response: Response, next: NextFunction) => {
      const session = await database.startSession()
      session.startTransaction()

      try {
        const { tenantId } = request

        const {
          accessReleaseInvitationId,
          phone,
          name,
          responsibleId,
          cpf,
          picture,
          guestId
        } = request.body

        new Rules().validate(
          { phone, isRequiredField: false },
          { picture, isRequiredField: false },
          { guestId, isRequiredField: false },
          { accessReleaseInvitationId },
          { name },
          { responsibleId },
          { cpf }
        )

        const personType = await PersonTypeMongoDB.findOne({
          name: 'Visitante',
          tenantId
        })

        if (!personType) {
          throw CustomResponse.NOT_FOUND('Tipo de pessoa não cadastrado!', {
            name: 'Visitante'
          })
        }

        let personId: Types.ObjectId | undefined = guestId ? ObjectId(guestId) : undefined

        if (!personId) {
          const person = await PersonServiceImp.findByCpf({
            cpf,
            tenantId
          })

          if (person) {
            personId = person._id!

            if (picture) {
              await PersonServiceImp.update({
                id: personId,
                tenantId,
                data: {
                  picture
                },
                session
              })
            }
          } else {
            const personModel = new PersonModel({
              tenantId,
              actions: [{
                action: ModelAction.create,
                date: DateUtils.getCurrent()
              }],
              personTypeId: personType._id,
              name,
              phone,
              responsibleId,
              cpf,
              picture,
              creationType: PersonCreationType.invite
            })

            const createdPerson = await PersonServiceImp.create(personModel, session)

            personId = createdPerson._id!
          }
        }

        const accessRelease = await AccessReleaseCreationService.createByAccessReleaseInvitationId({
          accessReleaseInvitationId: ObjectId(accessReleaseInvitationId),
          tenantId,
          guestId: personId!,
          personTypeId: personType._id,
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
