import mongoose, { AggregatePaginateModel, Document, Types } from 'mongoose'

import Schema, { coreSchema } from '../../core/Schema'
import { IPasswordResetRequest, PasswordResetRequestStatus, PasswordResetRequestStatusValues } from './PasswordResetRequestModel'

export interface IPasswordResetRequestDocument extends Document, Omit<IPasswordResetRequest, '_id'> { }

export interface IPasswordResetRequestMongoDB extends AggregatePaginateModel<IPasswordResetRequest> { }

class PasswordResetRequestSchema extends Schema<IPasswordResetRequestDocument> {
  constructor () {
    const PasswordResetRequest = new mongoose.Schema({
      ...coreSchema,
      status: {
        type: String,
        enum: PasswordResetRequestStatus,
        default: PasswordResetRequestStatus.pending
      },
      userId: {
        type: Types.ObjectId,
        required: true
      },
      email: {
        type: String,
        required: true
      },
      token: {
        type: String,
        required: true
      },
      expirationDate: {
        type: Date,
        required: true
      },
      statusDates: {
        type: new mongoose.Schema(
          PasswordResetRequestStatusValues.reduce((acc, situation) => ({ ...acc, [situation]: Date }), {})
        ),
        default: {}
      }
    })

    super(PasswordResetRequest)
  }
}

export default new PasswordResetRequestSchema()
