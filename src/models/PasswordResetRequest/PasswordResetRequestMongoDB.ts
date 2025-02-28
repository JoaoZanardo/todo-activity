import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

import database from '../../config/database'
import { PasswordResetRequestRepository } from './PasswordResetRequestRepository'
import PasswordResetRequestSchema, { IPasswordResetRequestDocument, IPasswordResetRequestMongoDB } from './PasswordResetRequestSchema'

const passwordResetRequestSchema = PasswordResetRequestSchema.schema

passwordResetRequestSchema.plugin(mongooseAggregatePaginate)

const PasswordResetRequestMongoDB = database.model<IPasswordResetRequestDocument, IPasswordResetRequestMongoDB>(
  'PasswordResetRequest',
  passwordResetRequestSchema
)

export const PasswordResetRequestRepositoryImp = new PasswordResetRequestRepository(PasswordResetRequestMongoDB)

export default PasswordResetRequestMongoDB
