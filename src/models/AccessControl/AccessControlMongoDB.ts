import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

import database from '../../config/database'
import { AccessControlRepository } from './AccessControlRepository'
import AccessControlSchema, { IAccessControlDocument, IAccessControlMongoDB } from './AccessControlSchema'

const accessControlSchema = AccessControlSchema.schema

accessControlSchema.plugin(mongooseAggregatePaginate)

const AccessControlMongoDB = database.model<IAccessControlDocument, IAccessControlMongoDB>(
  'AccessControl',
  accessControlSchema
)

export const AccessControlRepositoryImp = new AccessControlRepository(AccessControlMongoDB)

export default AccessControlMongoDB
