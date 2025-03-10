import mongoose, { AggregatePaginateModel, Document, Types } from 'mongoose'

import Schema, { coreSchema } from '../../core/Schema'
import { IPushNotification, PushNotificationType } from './PushNotificationModel'

export interface IPushNotificationDocument extends Document, Omit<IPushNotification, '_id'> { }

export interface IPushNotificationMongoDB extends AggregatePaginateModel<IPushNotification> { }

class PushNotificationSchema extends Schema<IPushNotificationDocument> {
  constructor () {
    const pushNotification = new mongoose.Schema({
      ...coreSchema,
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date,

      userId: {
        type: Types.ObjectId,
        required: true
      },
      title: {
        type: String,
        required: true
      },
      body: {
        type: String,
        required: true
      },
      data: {
        type: Object,
        required: true
      },
      type: {
        type: String,
        enum: PushNotificationType,
        required: true
      }
    })

    super(pushNotification)
  }
}

export default new PushNotificationSchema()
