import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

import database from '../../config/database'
import { SynchronizationRepository } from './SynchronizationRepository'
import SynchronizationSchema, { ISynchronizationDocument, ISynchronizationMongoDB } from './SynchronizationSchema'

const synchronizationSchema = SynchronizationSchema.schema

synchronizationSchema.plugin(mongooseAggregatePaginate)

const SynchronizationMongoDB = database.model<ISynchronizationDocument, ISynchronizationMongoDB>(
  'Synchronization',
  synchronizationSchema
)

export const SynchronizationRepositoryImp = new SynchronizationRepository(SynchronizationMongoDB)

export default SynchronizationMongoDB
