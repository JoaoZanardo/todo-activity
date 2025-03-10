import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

import database from '../../config/database'
import { PushNotificationRepository } from './PushNotificationRepository'
import PushNotificationSchema, { IPushNotificationDocument, IPushNotificationMongoDB } from './PushNotificationSchema'

const pushNotificationSchema = PushNotificationSchema.schema

pushNotificationSchema.plugin(mongooseAggregatePaginate)

const PushNotificationMongoDB = database.model<IPushNotificationDocument, IPushNotificationMongoDB>(
  'PushNotification',
  pushNotificationSchema
)

export const PushNotificationRepositoryImp = new PushNotificationRepository(PushNotificationMongoDB)

export default PushNotificationMongoDB
