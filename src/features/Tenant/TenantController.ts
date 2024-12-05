import { NextFunction, Request, Response, Router } from 'express'

import { Controller } from '../../core/Controller'
import Rules from '../../core/Rules'
import { TenantRepositoryImp } from '../../models/Tenant/TenantMongoDB'
import ObjectId from '../../utils/ObjectId'
import { TenantRules } from './TenantRules'
import { TenantService } from './TenantService'

export const TenantServiceImp = new TenantService(TenantRepositoryImp)

class TenantController extends Controller {
  protected rules: Rules = new TenantRules()

  handle (): Router {
    this.router.get('/:tenantId', async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tenantId } = request.params

        this.rules.validate(
          { tenantId }
        )

        const tenant = await TenantServiceImp.findById(ObjectId(tenantId))

        response.OK('Tenente encontrado com sucesso!', {
          tenant: tenant.object
        })
      } catch (error) {
        next(error)
      }
    })

    return this.router
  }
}

const tenantController = new TenantController()
export default tenantController.handle()
