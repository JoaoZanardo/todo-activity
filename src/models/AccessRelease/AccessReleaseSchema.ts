import mongoose, { AggregatePaginateModel, Document, Types } from 'mongoose'

import Schema, { coreSchema } from '../../core/Schema'
import { TimeUnit } from '../PersonType/PersonTypeModel'
import { AccessReleaseStatus, AccessReleaseType, IAccessRelease } from './AccessReleaseModel'

export interface IAccessReleaseDocument extends Document, Omit<IAccessRelease, '_id'> { }

export interface IAccessReleaseMongoDB extends AggregatePaginateModel<IAccessRelease> { }

class AccessReleaseSchema extends Schema<IAccessReleaseDocument> {
  constructor () {
    const accessRelease = new mongoose.Schema({
      ...coreSchema,
      responsibleId: Types.ObjectId,
      observation: String,
      picture: String,
      expiringTime: {
        value: String,
        unit: {
          type: String,
          enum: TimeUnit
        }
      },
      singleAccess: {
        type: Boolean,
        default: true
      },
      personTypeCategoryId: Types.ObjectId,
      status: {
        type: String,
        enum: AccessReleaseStatus
      },
      initDate: Date,
      endDate: Date,
      synchronizations: {
        type: [
          {
            error: Boolean,
            errorMessage: String,
            accessPoint: {
              type: Object,
              required: true
            },
            equipment: {
              type: Object,
              required: true
            }
          }
        ],
        default: []
      },

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
      finalAreaId: {
        type: Types.ObjectId,
        required: true
      }
    })

    super(accessRelease)
  }
}

export default new AccessReleaseSchema()
