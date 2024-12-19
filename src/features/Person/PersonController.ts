import { NextFunction, Request, Response, Router } from 'express'

import { Controller } from '../../core/Controller'
import { ModelAction } from '../../core/interfaces/Model'
import Rules from '../../core/Rules'
import { permissionAuthMiddleware } from '../../middlewares/permissionAuth'
import { Permission } from '../../models/AccessGroup/AccessGroupModel'
import { PersonModel } from '../../models/Person/PersonModel'
import { PersonRepositoryImp } from '../../models/Person/PersonMongoDB'
import { DateUtils } from '../../utils/Date'
import ObjectId from '../../utils/ObjectId'
import { PersonRules } from './PersonRules'
import { PersonService } from './PersonService'

export const PersonServiceImp = new PersonService(PersonRepositoryImp)

class PersonController extends Controller {
  protected rules: Rules = new PersonRules()

  handle (): Router {
    this.router.get(
      '/',
      permissionAuthMiddleware(Permission.read),
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const { tenantId } = request

          const filters = PersonModel.listFilters({
            tenantId,
            ...request.query
          })

          const people = await PersonServiceImp.list(filters)

          response.OK('Pessoas encontradas com sucesso!', {
            people
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
            address,
            contractEndDate,
            contractInitDate,
            document,
            email,
            name,
            observation,
            phone,
            personTypeId,
            cnh,
            cnhExpirationDate,
            workScheduleId,
            responsibleId,
            cnpj,
            register,
            role,
            rg,
            passport

          } = request.body

          this.rules.validate(
            { contractEndDate, isRequiredField: false },
            { contractInitDate, isRequiredField: false },
            { email, isRequiredField: false },
            { observation, isRequiredField: false },
            { name },
            { personTypeId },
            { document },
            { phone },
            { address },
            { cnh },
            { cnhExpirationDate },
            { workScheduleId },
            { responsibleId },
            { cnpj },
            { register },
            { role },
            { rg },
            { passport }
          )

          const personModel = new PersonModel({
            tenantId,
            actions: [{
              action: ModelAction.create,
              date: DateUtils.getCurrent(),
              userId
            }],
            personTypeId: ObjectId(personTypeId),
            address,
            contractEndDate,
            contractInitDate,
            document,
            email,
            name,
            observation,
            phone,
            cnh,
            cnhExpirationDate,
            workScheduleId,
            responsibleId,
            cnpj,
            register,
            role,
            rg,
            passport
          })

          const person = await PersonServiceImp.create(personModel)

          response.OK('Pessoa cadastrada com sucesso!', {
            person: person.show
          })
        } catch (error) {
          next(error)
        }
      })

    this.router.patch(
      '/:personId',
      permissionAuthMiddleware(Permission.update),
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const { tenantId, userId } = request

          const { personId } = request.params

          const {
            address,
            contractEndDate,
            contractInitDate,
            document,
            email,
            name,
            observation,
            phone,
            active,
            cnh,
            cnhExpirationDate,
            workScheduleId,
            responsibleId,
            cnpj,
            register,
            role,
            rg,
            passport
          } = request.body

          this.rules.validate(
            { name, isRequiredField: false },
            { address, isRequiredField: false },
            { contractEndDate, isRequiredField: false },
            { contractInitDate, isRequiredField: false },
            { document, isRequiredField: false },
            { email, isRequiredField: false },
            { observation, isRequiredField: false },
            { phone, isRequiredField: false },
            { active, isRequiredField: false },
            { cnh, isRequiredField: false },
            { cnhExpirationDate, isRequiredField: false },
            { workScheduleId, isRequiredField: false },
            { responsibleId, isRequiredField: false },
            { cnpj, isRequiredField: false },
            { register, isRequiredField: false },
            { role, isRequiredField: false },
            { rg, isRequiredField: false },
            { passport, isRequiredField: false },
            { personId }
          )

          await PersonServiceImp.update({
            id: ObjectId(personId),
            tenantId,
            data: {
              address,
              contractEndDate,
              contractInitDate,
              document,
              email,
              name,
              observation,
              phone,
              active,
              cnh,
              cnhExpirationDate,
              workScheduleId,
              responsibleId,
              cnpj,
              register,
              role,
              rg,
              passport
            },
            responsibleId: userId
          })

          response.OK('Pessoa atualizada com sucesso!')
        } catch (error) {
          next(error)
        }
      })

    this.router.delete(
      '/:personId',
      permissionAuthMiddleware(Permission.delete),
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const { tenantId, userId } = request

          const { personId } = request.params

          this.rules.validate(
            { personId }
          )

          await PersonServiceImp.delete({
            id: ObjectId(personId),
            tenantId,
            responsibleId: userId
          })

          response.OK('Pessoa removida com sucesso!')
        } catch (error) {
          next(error)
        }
      })

    return this.router
  }
}

const personController = new PersonController()
export default personController.handle()
