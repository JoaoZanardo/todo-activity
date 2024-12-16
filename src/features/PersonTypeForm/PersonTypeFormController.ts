import { NextFunction, Request, Response, Router } from 'express'

import { Controller } from '../../core/Controller'
import Rules from '../../core/Rules'
import { permissionAuthMiddleware } from '../../middlewares/permissionAuth'
import { Permission } from '../../models/AccessGroup/AccessGroupModel'
import { PersonTypeFormRepositoryImp } from '../../models/PersonTypeForm/PersonTypeFormMongoDB'
import ObjectId from '../../utils/ObjectId'
import { PersonTypeFormRules } from './PersonTypeFormRules'
import { PersonTypeFormService } from './PersonTypeFormService'

export const PersonTypeFormServiceImp = new PersonTypeFormService(PersonTypeFormRepositoryImp)

class PersonTypeFormController extends Controller {
  protected rules: Rules = new PersonTypeFormRules()

  handle (): Router {
    this.router.get(
      '/:personTypeFormId',
      permissionAuthMiddleware(Permission.read),
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const { tenantId } = request

          const { personTypeFormId } = request.params

          this.rules.validate(
            { personTypeFormId }
          )

          const personTypeForm = await PersonTypeFormServiceImp.findById({
            id: ObjectId(personTypeFormId),
            tenantId
          })

          response.OK('Formulário de tipo de pessoa encontrado com sucesso!', {
            personTypeForm: personTypeForm.show
          })
        } catch (error) {
          next(error)
        }
      })

    this.router.get(
      '/personType/:personTypeId',
      permissionAuthMiddleware(Permission.read),
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const { tenantId } = request

          const { personTypeId } = request.params

          this.rules.validate(
            { personTypeId }
          )

          const personTypeForm = await PersonTypeFormServiceImp.findByPersonTypeId({
            personTypeId: ObjectId(personTypeId),
            tenantId
          })

          response.OK('Formulário de tipo de pessoa encontrado com sucesso!', {
            personTypeForm: personTypeForm.show
          })
        } catch (error) {
          next(error)
        }
      })

    this.router.patch(
      '/:personTypeFormId',
      permissionAuthMiddleware(Permission.update),
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const { tenantId, userId } = request

          const { personTypeFormId } = request.params

          const {
            fields
          } = request.body

          this.rules.validate(
            { fields, isRequiredField: false }
          )

          await PersonTypeFormServiceImp.update({
            id: ObjectId(personTypeFormId),
            tenantId,
            data: {
              fields
            },
            responsibleId: userId
          })

          response.OK('Formulário de tipo de pessoa atualizado com sucesso!')
        } catch (error) {
          next(error)
        }
      })

    return this.router
  }
}

const personTypeFormController = new PersonTypeFormController()
export default personTypeFormController.handle()
