import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

import database from '../../config/database'
import { AccessReleaseRepository } from './AccessReleaseRepository'
import AccessReleaseSchema, { IAccessReleaseDocument, IAccessReleaseMongoDB } from './AccessReleaseSchema'

const accessReleaseSchema = AccessReleaseSchema.schema

accessReleaseSchema.plugin(mongooseAggregatePaginate)

const AccessReleaseMongoDB = database.model<IAccessReleaseDocument, IAccessReleaseMongoDB>(
  'AccessRelease',
  accessReleaseSchema
)

export const AccessReleaseRepositoryImp = new AccessReleaseRepository(AccessReleaseMongoDB)

export default AccessReleaseMongoDB
