import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

import database from '../../config/database'
import { AccessPointRepository } from './AccessPointRepository'
import AccessPointSchema, { IAccessPointDocument, IAccessPointMongoDB } from './AccessPointSchema'

const accessPointSchema = AccessPointSchema.schema

accessPointSchema.plugin(mongooseAggregatePaginate)

const AccessPointMongoDB = database.model<IAccessPointDocument, IAccessPointMongoDB>(
  'AccessPoint',
  accessPointSchema
)

export const AccessPointRepositoryImp = new AccessPointRepository(AccessPointMongoDB)

export default AccessPointMongoDB
