import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

import database from '../../config/database'
import { AccessSynchronizationRepository } from './AccessSynchronizationRepository'
import AccessSynchronizationSchema, { IAccessSynchronizationDocument, IAccessSynchronizationMongoDB } from './AccessSynchronizationSchema'

const accessAccessSynchronizationSchema = AccessSynchronizationSchema.schema

accessAccessSynchronizationSchema.plugin(mongooseAggregatePaginate)

const AccessSynchronizationMongoDB = database.model<IAccessSynchronizationDocument, IAccessSynchronizationMongoDB>(
  'AccessSynchronization',
  accessAccessSynchronizationSchema
)

export const AccessSynchronizationRepositoryImp = new AccessSynchronizationRepository(AccessSynchronizationMongoDB)

export default AccessSynchronizationMongoDB
