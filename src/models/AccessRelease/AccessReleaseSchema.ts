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
            date: Date,
            syncType: String,
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
      accessPointId: Types.ObjectId,
      noticeId: Types.ObjectId,
      workSchedulesCodes: {
        type: Array<Number>,
        default: []
      },
      accessReleaseInvitationId: Types.ObjectId,
      areasIds: Array<Types.ObjectId>,

      type: {
        type: String,
        enum: AccessReleaseType,
        default: AccessReleaseType.default
      },
      personId: {
        type: Types.ObjectId,
        required: true
      },
      personTypeId: {
        type: Types.ObjectId,
        required: true
      },
      finalAreasIds: {
        type: Types.ObjectId,
        required: true
      }
    })

    super(accessRelease)
  }
}

export default new AccessReleaseSchema()
