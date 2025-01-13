import mongoose, { AggregatePaginateModel, Document, Types } from 'mongoose'

import Schema, { coreSchema } from '../../core/Schema'
import { AccessControlType, AccessRelease, IAccessControl } from './AccessControlModel'

export interface IAccessControlDocument extends Document, Omit<IAccessControl, '_id'> { }

export interface IAccessControlMongoDB extends AggregatePaginateModel<IAccessControl> { }

class AccessControlSchema extends Schema<IAccessControlDocument> {
  constructor () {
    const AccessControl = new mongoose.Schema({
      ...coreSchema,
      personTypeCategoryId: Types.ObjectId,
      responsibleId: Types.ObjectId,
      observation: String,

      type: {
        type: String,
        enum: AccessControlType,
        required: true
      },
      personId: {
        type: Types.ObjectId,
        required: true
      },
      personTypeId: {
        type: Types.ObjectId,
        required: true
      },
      accessRelease: {
        type: String,
        enum: AccessRelease,
        required: true
      }
    })

    super(AccessControl)
  }
}

export default new AccessControlSchema()
