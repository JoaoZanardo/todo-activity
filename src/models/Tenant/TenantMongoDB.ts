import database from '../../config/database'
import { TenantRepository } from './TenantRepository'
import TenantSchema, { ITenantDocument, ITenantMongoDB } from './TenantSchema'

const tenantSchema = TenantSchema.schema

const TenantMongoDB = database.model<ITenantDocument, ITenantMongoDB>(
  'Tenant',
  tenantSchema
)

export const TenantRepositoryImp = new TenantRepository(TenantMongoDB)

export default TenantMongoDB
