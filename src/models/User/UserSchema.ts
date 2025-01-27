import mongoose, { AggregatePaginateModel, Document, Types } from 'mongoose'

import Schema, { coreSchema } from '../../core/Schema'
import Bcrypt from '../../libraries/Bcrypt'
import { IUser } from './UserModel'

export interface IUserDocument extends Document, Omit<IUser, '_id'> { }

export interface IUserMongoDB extends AggregatePaginateModel<IUser> { }

class UserSchema extends Schema<IUserDocument> {
  constructor () {
    const user = new mongoose.Schema({
      ...coreSchema,
      accessGroupId: {
        type: Types.ObjectId,
        ref: 'AccessGroup'
      },
      email: String,
      admin: {
        type: Boolean,
        default: false
      },
      password: {
        type: String,
        required: true
      },
      name: {
        type: String,
        required: true
      },
      login: {
        type: String,
        required: true
      }
    })

    user.pre<IUserDocument>('save', async function (): Promise<void> {
      if (!this.password || !this.isModified('password')) return
      try {
        this.password = await Bcrypt.hash(this.password)
      } catch (err) {
        console.error(`Error hashing the password for the user ${this.name}`, err)
      }
    })

    super(user)
  }
}

export default new UserSchema()
