import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

import database from '../../config/database'
import { AccessReleaseInvitationRepository } from './AccessReleaseInvitationRepository'
import AccessReleaseInvitationSchema, { IAccessReleaseInvitationDocument, IAccessReleaseInvitationMongoDB } from './AccessReleaseInvitationSchema'

const accessReleaseInvitationSchema = AccessReleaseInvitationSchema.schema

accessReleaseInvitationSchema.plugin(mongooseAggregatePaginate)

const AccessReleaseInvitationMongoDB = database.model<IAccessReleaseInvitationDocument, IAccessReleaseInvitationMongoDB>(
  'AccessReleaseInvitation',
  accessReleaseInvitationSchema
)

export const AccessReleaseInvitationRepositoryImp = new AccessReleaseInvitationRepository(AccessReleaseInvitationMongoDB)

export default AccessReleaseInvitationMongoDB
