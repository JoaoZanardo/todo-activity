import { Aggregate, ClientSession, Types } from 'mongoose'

import { IFindModelByIdProps } from '../../core/interfaces/Model'
import { IAggregatePaginate, IUpdateProps } from '../../core/interfaces/Repository'
import { Repository } from '../../core/Repository'
import { IListPushNotificationsFilters, IPushNotification, PushNotificationModel, PushNotificationType } from './PushNotificationModel'
import { IPushNotificationMongoDB } from './PushNotificationSchema'

export class PushNotificationRepository extends Repository<IPushNotificationMongoDB, PushNotificationModel> {
  async findById ({
    id,
    tenantId
  }: IFindModelByIdProps): Promise<PushNotificationModel | null> {
    const document = await this.mongoDB.findOne({
      _id: id,
      tenantId,
      deletionDate: null
    })
    if (!document) return null

    return new PushNotificationModel(document)
  }

  async findAllUnsent (): Promise<Array<PushNotificationModel>> {
    const documents = await this.mongoDB.find({
      sent: false,
      deletionDate: null
    })

    const models = documents.map(document => new PushNotificationModel(document))

    return models
  }

  async sentToday (userId: Types.ObjectId): Promise<boolean> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return Boolean(
      await this.mongoDB.exists({
        sent: true,
        sentAt: { $gte: today },
        userId,
        type: PushNotificationType.random,
        deletionDate: null
      }))
  }

  async create (pushNotifcation: PushNotificationModel, session?: ClientSession): Promise<PushNotificationModel> {
    const document = await this.mongoDB.create([pushNotifcation.object], {
      session
    })

    return new PushNotificationModel(document[0])
  }

  async update ({
    id,
    tenantId,
    data,
    session
  }: IUpdateProps<IPushNotification>): Promise<boolean> {
    const updated = await this.mongoDB.updateOne({
      _id: id,
      tenantId
    }, {
      $set: data
    }, {
      session
    })

    return !!updated.modifiedCount
  }

  async list ({ limit, page, ...filters }: IListPushNotificationsFilters): Promise<IAggregatePaginate<IPushNotification>> {
    const aggregationStages: Aggregate<Array<any>> = this.mongoDB.aggregate([
      { $match: filters },
      { $sort: { _id: -1 } }
    ])

    return await this.mongoDB.aggregatePaginate(
      aggregationStages,
      {
        limit,
        page
      })
  }
}
