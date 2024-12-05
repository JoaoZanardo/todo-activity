import { Types } from 'mongoose'

import { TenantModel } from '../../models/Tenant/TenantModel'
import { TenantRepositoryImp } from '../../models/Tenant/TenantMongoDB'
import CustomResponse from '../../utils/CustomResponse'

export class TenantService {
  constructor (
    private tenantRepositoryImp: typeof TenantRepositoryImp
  ) {
    this.tenantRepositoryImp = tenantRepositoryImp
  }

  async findById (id: Types.ObjectId): Promise<TenantModel> {
    const tenant = await this.tenantRepositoryImp.findOneById(id)
    if (!tenant) throw CustomResponse.NOT_FOUND('Tenente não cadastrado!')

    return tenant
  }
}
