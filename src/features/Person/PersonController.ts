import { NextFunction, Request, Response, Router } from 'express'

import { Controller } from '../../core/Controller'
import Rules from '../../core/Rules'
import { permissionAuthMiddleware } from '../../middlewares/permissionAuth'
import { Permission } from '../../models/AccessGroup/AccessGroupModel'
import { PersonModel } from '../../models/Person/PersonModel'
import { PersonRepositoryImp } from '../../models/Person/PersonMongoDB'
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

          const persons = await PersonServiceImp.list(filters)

          response.OK('Pessoas encontradas com sucesso!', {
            persons
          })
        } catch (error) {
          next(error)
        }
      })

    return this.router
  }
}

const personController = new PersonController()
export default personController.handle()
