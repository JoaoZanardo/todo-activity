import { NextFunction, Request, Response } from 'express'

import { TenantServiceImp } from '../features/Tenant/TenantController'
import CustomResponse from '../utils/CustomResponse'
import ObjectId from '../utils/ObjectId'

export const tenantAuthMiddleware = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const tenantId = request.headers.tenant as string

    console.log('tenantId', tenantId)

    if (!tenantId) throw CustomResponse.UNAUTHORIZED('Acesso negado!')

    const tenant = await TenantServiceImp.findById(ObjectId(tenantId))
    if (!tenant) {
      throw CustomResponse.NOT_FOUND('Tenente não cadastrada!', {
        tenant
      })
    }

    request.tenantId = ObjectId(tenantId)

    next()
  } catch (error) {
    next(error)
  }
}
