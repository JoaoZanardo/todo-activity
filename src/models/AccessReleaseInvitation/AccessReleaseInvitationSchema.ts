import mongoose, { AggregatePaginateModel, Document, Types } from 'mongoose'

import Schema, { coreSchema } from '../../core/Schema'
import { AccessReleaseInvitationStatus, IAccessReleaseInvitation } from './AccessReleaseInvitationModel'

export interface IAccessReleaseInvitationDocument extends Document, Omit<IAccessReleaseInvitation, '_id'> { }

export interface IAccessReleaseInvitationMongoDB extends AggregatePaginateModel<IAccessReleaseInvitation> { }

class AccessReleaseInvitationSchema extends Schema<IAccessReleaseInvitationDocument> {
  constructor () {
    const accessReleaseInvitation = new mongoose.Schema({
      ...coreSchema,
      observation: String,
      status: {
        type: String,
        enum: AccessReleaseInvitationStatus
      },
      accessReleaseId: Types.ObjectId,
      groupId: Types.ObjectId,

      initDate: {
        type: Date,
        required: true
      },
      endDate: {
        type: Date,
        required: true
      },
      areaId: {
        type: Types.ObjectId,
        required: true
      }
    })

    super(accessReleaseInvitation)
  }
}

export default new AccessReleaseInvitationSchema()
