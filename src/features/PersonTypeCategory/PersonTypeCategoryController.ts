import { NextFunction, Request, Response, Router } from 'express'

import database from '../../config/database'
import { Controller } from '../../core/Controller'
import { ModelAction } from '../../core/interfaces/Model'
import Rules from '../../core/Rules'
import { permissionAuthMiddleware } from '../../middlewares/permissionAuth'
import { Permission } from '../../models/AccessGroup/AccessGroupModel'
import { PersonTypeCategoryModel } from '../../models/PersonTypeCategory/PersonTypeCategoryModel'
import { PersonTypeCategoryRepositoryImp } from '../../models/PersonTypeCategory/PersonTypeCategoryMongoDB'
import { DateUtils } from '../../utils/Date'
import ObjectId from '../../utils/ObjectId'
import { PersonTypeCategoryRules } from './PersonTypeCategoryRules'
import { PersonTypeCategoryService } from './PersonTypeCategoryService'

export const PersonTypeCategoryServiceImp = new PersonTypeCategoryService(PersonTypeCategoryRepositoryImp)

class PersonTypeCategoryController extends Controller {
  protected rules: Rules = new PersonTypeCategoryRules()

  handle (): Router {
    this.router.get(
      '/',
      permissionAuthMiddleware(Permission.read),
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const { tenantId } = request

          const filters = PersonTypeCategoryModel.listFilters({
            tenantId,
            ...request.query
          })

          const personTypeCategories = await PersonTypeCategoryServiceImp.list(filters)

          response.OK('Categorias de tipo de pessoa encontradas com sucesso!', {
            personTypeCategories
          })
        } catch (error) {
          next(error)
        }
      })

    this.router.get('/select', async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tenantId } = request

        console.log()

        const personTypeCategories = await PersonTypeCategoryServiceImp.findAll({
          tenantId,
          select: ['_id', 'name', 'description']
        })

        response.OK('Categorias de tipo de pessoa encontradas com sucesso!', {
          personTypeCategories
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
            appAccess,
            personTypeId
          } = request.body

          this.rules.validate(
            { name },
            { personTypeId },
            { description, isRequiredField: false },
            { expiringTime, isRequiredField: false },
            { appAccess, isRequiredField: false }
          )

          const personTypeCategoryModel = new PersonTypeCategoryModel({
            tenantId,
            actions: [{
              action: ModelAction.create,
              date: DateUtils.getCurrent(),
              userId
            }],
            name,
            personTypeId,
            description,
            expiringTime,
            appAccess
          })

          const personTypeCategory = await PersonTypeCategoryServiceImp.create(personTypeCategoryModel, session)

          await session.commitTransaction()
          session.endSession()

          response.OK('Categoria de tipo de pessoa cadastrada com sucesso!', {
            personTypeCategory: personTypeCategory.show
          })
        } catch (error) {
          session.endSession()

          next(error)
        }
      })

    this.router.patch(
      '/:personTypeCategoryId',
      permissionAuthMiddleware(Permission.update),
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const { tenantId, userId } = request

          const { personTypeCategoryId } = request.params

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
            { personTypeCategoryId }
          )

          await PersonTypeCategoryServiceImp.update({
            id: ObjectId(personTypeCategoryId),
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

          response.OK('Categoria de tipo de pessoa atualizada com sucesso!')
        } catch (error) {
          next(error)
        }
      })

    this.router.delete(
      '/:personTypeCategoryId',
      permissionAuthMiddleware(Permission.delete),
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const { tenantId, userId } = request

          const { personTypeCategoryId } = request.params

          this.rules.validate(
            { personTypeCategoryId }
          )

          await PersonTypeCategoryServiceImp.delete({
            id: ObjectId(personTypeCategoryId),
            tenantId,
            responsibleId: userId
          })

          response.OK('Categoria de tipo de pessoa removida com sucesso!')
        } catch (error) {
          next(error)
        }
      })

    return this.router
  }
}

const personTypeCategoryController = new PersonTypeCategoryController()
export default personTypeCategoryController.handle()
