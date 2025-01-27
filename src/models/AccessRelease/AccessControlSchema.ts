import mongoose, { AggregatePaginateModel, Document, Types } from 'mongoose'

import Schema, { coreSchema } from '../../core/Schema'
import { AccessReleaseType, IAccessRelease } from './AccessReleaseModel'

export interface IAccessReleaseDocument extends Document, Omit<IAccessRelease, '_id'> { }

export interface IAccessReleaseMongoDB extends AggregatePaginateModel<IAccessRelease> { }

class AccessReleaseSchema extends Schema<IAccessReleaseDocument> {
  constructor () {
    const accessRelease = new mongoose.Schema({
      ...coreSchema,
      personTypeCategoryId: Types.ObjectId,
      responsibleId: Types.ObjectId,
      observation: String,
      picture: String,

      type: {
        type: String,
        enum: AccessReleaseType,
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
      accessPointId: {
        type: Types.ObjectId,
        required: true
      },
      areasIds: {
        type: Array<Types.ObjectId>,
        required: true
      },
      accessRelease: {
        type: String,
        enum: AccessRelease,
        required: true
      }
    })

    super(accessRelease)
  }
}

export default new AccessReleaseSchema()
