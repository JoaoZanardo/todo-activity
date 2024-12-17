import { NextFunction, Request, Response, Router } from 'express'

import database from '../../config/database'
import { Controller } from '../../core/Controller'
import { ModelAction } from '../../core/interfaces/Model'
import Rules from '../../core/Rules'
import { permissionAuthMiddleware } from '../../middlewares/permissionAuth'
import { Permission } from '../../models/AccessGroup/AccessGroupModel'
import { PersonTypeModel } from '../../models/PersonType/PersonTypeModel'
import { PersonTypeRepositoryImp } from '../../models/PersonType/PersonTypeMongoDB'
import { DateUtils } from '../../utils/Date'
import ObjectId from '../../utils/ObjectId'
import { PersonTypeRules } from './PersonTypeRules'
import { PersonTypeService } from './PersonTypeService'

export const PersonTypeServiceImp = new PersonTypeService(PersonTypeRepositoryImp)

class PersonTypeController extends Controller {
  protected rules: Rules = new PersonTypeRules()

  handle (): Router {
    this.router.get(
      '/',
      permissionAuthMiddleware(Permission.read),
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const { tenantId } = request

          const filters = PersonTypeModel.listFilters({
            tenantId,
            ...request.query
          })

          const personTypes = await PersonTypeServiceImp.list(filters)

          response.OK('Tipos de pessoas encontrados com sucesso!', {
            personTypes
          })
        } catch (error) {
          next(error)
        }
      })

    this.router.get('/select', async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tenantId } = request

        console.log()

        const personTypes = await PersonTypeServiceImp.findAll({
          tenantId,
          select: ['_id', 'name', 'description']
        })

        response.OK('Tipos de pessoas encontrados com sucesso!', {
          personTypes
        })
      } catch (error) {
        next(error)
      }
    })

    this.router.get(
      '/one/:personTypeId',
      permissionAuthMiddleware(Permission.read),
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const { tenantId } = request

          const { personTypeId } = request.params

          this.rules.validate(
            { personTypeId }
          )

          const personType = await PersonTypeServiceImp.findById({
            id: ObjectId(personTypeId),
            tenantId
          })

          response.OK('Tipo de pessoa encontrado com sucesso!', {
            personType: personType.show
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
            name,
            description,
            expiringTime,
            appAccess
          } = request.body

          this.rules.validate(
            { name },
            { description, isRequiredField: false },
            { expiringTime, isRequiredField: false },
            { appAccess, isRequiredField: false }
          )

          const personTypeModel = new PersonTypeModel({
            tenantId,
            actions: [{
              action: ModelAction.create,
              date: DateUtils.getCurrent(),
              userId
            }],
            name,
            description,
            expiringTime,
            appAccess
          })

          const personType = await PersonTypeServiceImp.create(personTypeModel, session)

          await session.commitTransaction()
          session.endSession()

          response.OK('Tipo de pessoa cadastrado com sucesso!', {
            personType: personType.show
          })
        } catch (error) {
          session.endSession()

          next(error)
        }
      })

    this.router.patch(
      '/:personTypeId',
      permissionAuthMiddleware(Permission.update),
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const { tenantId, userId } = request

          const { personTypeId } = request.params

          const {
            name,
            description,
            expiringTime,
            appAccess,
            active
          } = request.body

          this.rules.validate(
            { name, isRequiredField: false },
            { description, isRequiredField: false },
            { expiringTime, isRequiredField: false },
            { appAccess, isRequiredField: false },
            { active, isRequiredField: false },
            { personTypeId }
          )

          await PersonTypeServiceImp.update({
            id: ObjectId(personTypeId),
            tenantId,
            data: {
              name,
              description,
              expiringTime,
              appAccess,
              active
            },
            responsibleId: userId
          })

          response.OK('Tipo de pessoa atualizado com sucesso!')
        } catch (error) {
          next(error)
        }
      })

    this.router.delete(
      '/:personTypeId',
      permissionAuthMiddleware(Permission.delete),
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const { tenantId, userId } = request

          const { personTypeId } = request.params

          this.rules.validate(
            { personTypeId }
          )

          await PersonTypeServiceImp.delete({
            id: ObjectId(personTypeId),
            tenantId,
            responsibleId: userId
          })

          response.OK('Tipo de pessoa removido com sucesso!')
        } catch (error) {
          next(error)
        }
      })

    return this.router
  }
}

const personTypeController = new PersonTypeController()
export default personTypeController.handle()
