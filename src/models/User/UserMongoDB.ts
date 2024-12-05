import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

import database from '../../config/database'
import { UserRepository } from './UserRepository'
import UserSchema, { IUserDocument, IUserMongoDB } from './UserSchema'

const userSchema = UserSchema.schema

userSchema.plugin(mongooseAggregatePaginate)

const UserMongoDB = database.model<IUserDocument, IUserMongoDB>(
  'User',
  userSchema
)

export const UserRepositoryImp = new UserRepository(UserMongoDB)

export default UserMongoDB
