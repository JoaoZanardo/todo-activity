import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

import database from '../../config/database'
import { AccessAreaRepository } from './AccessAreaRepository'
import AccessAreaSchema, { IAccessAreaDocument, IAccessAreaMongoDB } from './AccessAreaSchema'

const accessAreaSchema = AccessAreaSchema.schema

accessAreaSchema.plugin(mongooseAggregatePaginate)

const AccessAreaMongoDB = database.model<IAccessAreaDocument, IAccessAreaMongoDB>(
  'AccessArea',
  accessAreaSchema
)

export const AccessAreaRepositoryImp = new AccessAreaRepository(AccessAreaMongoDB)

export default AccessAreaMongoDB
