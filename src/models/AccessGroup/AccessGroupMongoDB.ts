import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

import database from '../../config/database'
import { AccessGroupRepository } from './AccessGroupRepository'
import AccessGroupSchema, { IAccessGroupDocument, IAccessGroupMongoDB } from './AccessGroupSchema'

const accessGroupSchema = AccessGroupSchema.schema

accessGroupSchema.plugin(mongooseAggregatePaginate)

const AccessGroupMongoDB = database.model<IAccessGroupDocument, IAccessGroupMongoDB>(
  'AccessGroup',
  accessGroupSchema
)

export const AccessGroupRepositoryImp = new AccessGroupRepository(AccessGroupMongoDB)

export default AccessGroupMongoDB
