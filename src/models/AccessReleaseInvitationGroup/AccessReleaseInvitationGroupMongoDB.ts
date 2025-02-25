import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

import database from '../../config/database'
import { AccessReleaseInvitationGroupRepository } from './AccessReleaseInvitationGroupRepository'
import AccessReleaseInvitationGroupSchema, { IAccessReleaseInvitationGroupDocument, IAccessReleaseInvitationGroupMongoDB } from './AccessReleaseInvitationGroupSchema'

const accessReleaseInvitationGroupSchema = AccessReleaseInvitationGroupSchema.schema

accessReleaseInvitationGroupSchema.plugin(mongooseAggregatePaginate)

const AccessReleaseInvitationGroupMongoDB = database.model<IAccessReleaseInvitationGroupDocument, IAccessReleaseInvitationGroupMongoDB>(
  'AccessReleaseInvitationGroup',
  accessReleaseInvitationGroupSchema
)

export const AccessReleaseInvitationGroupRepositoryImp = new AccessReleaseInvitationGroupRepository(AccessReleaseInvitationGroupMongoDB)

export default AccessReleaseInvitationGroupMongoDB
