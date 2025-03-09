import mongoose, { AggregatePaginateModel, Document, Types } from 'mongoose'

import Schema, { coreSchema } from '../../core/Schema'
import { IAccessReleaseInvitationGroup } from './AccessReleaseInvitationGroupModel'

export interface IAccessReleaseInvitationGroupDocument extends Document, Omit<IAccessReleaseInvitationGroup, '_id'> { }

export interface IAccessReleaseInvitationGroupMongoDB extends AggregatePaginateModel<IAccessReleaseInvitationGroup> { }

class AccessReleaseInvitationGroupSchema extends Schema<IAccessReleaseInvitationGroupDocument> {
  constructor () {
    const accessReleaseInvitationGroup = new mongoose.Schema({
      ...coreSchema,
      description: String,
      expired: {
        type: Boolean,
        default: false
      },

      title: {
        type: String,
        required: true
      },
      areaId: {
        type: String,
        required: true
      },
      initDate: {
        type: Date,
        required: true
      },
      endDate: {
        type: Date,
        required: true
      },
      personId: {
        type: Types.ObjectId,
        required: true
      }
    })

    super(accessReleaseInvitationGroup)
  }
}

export default new AccessReleaseInvitationGroupSchema()
