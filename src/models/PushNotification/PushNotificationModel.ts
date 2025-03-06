import { Types } from 'mongoose'

import { IListModelsFilters, IModel, IUpdateModelProps } from '../../core/interfaces/Model'
import Model from '../../core/Model'

export interface IListPushNotificationsFilters extends IListModelsFilters { }

export interface IUpdatePushNotificationProps extends IUpdateModelProps<IPushNotification> { }

export interface IPushNotificationData {
  redirect?: {
    params?: { [key: string]: any }

    screen: string
  }
  userId?: Types.ObjectId
}

export enum PushNotificationType {
  specific = 'specific',
  random = 'random'
}

export interface IPushNotification extends IModel {
  sent?: boolean
  sentAt?: Date
  userId?: Types.ObjectId

  title: string
  body: string
  data: IPushNotificationData
  type: PushNotificationType
}

export class PushNotificationModel extends Model<IPushNotification> {
  private _sent?: IPushNotification['sent']
  private _sentAt?: IPushNotification['sentAt']
  private _userId?: IPushNotification['userId']

  private _title: IPushNotification['title']
  private _body: IPushNotification['body']
  private _data: IPushNotification['data']
  private _type: IPushNotification['type']

  constructor (pushNotification: IPushNotification) {
    super(pushNotification)

    this._sent = pushNotification.sent ?? false
    this._sentAt = pushNotification.sentAt
    this._type = pushNotification.type ?? PushNotificationType.specific
    this._userId = pushNotification.userId

    this._title = pushNotification.title
    this._body = pushNotification.body
    this._data = pushNotification.data
  }

  get object (): IPushNotification {
    return {
      _id: this._id,
      tenantId: this.tenantId,
      actions: this.actions,
      active: this.active,
      createdAt: this.createdAt,
      deletionDate: this.deletionDate,
      sent: this._sent,
      sentAt: this._sentAt,
      userId: this._userId,
      title: this._title,
      body: this._body,
      data: this._data,
      type: this._type
    }
  }

  get show (): IPushNotification {
    return this.object
  }

  static listFilters (
    {
      search,
      limit,
      page
    }: Partial<IListPushNotificationsFilters>
  ): IListPushNotificationsFilters {
    const filters = {
      deletionDate: undefined
    } as IListPushNotificationsFilters

    if (search) {
      Object.assign(filters, {
        $or: [
        ]
      })
    }
    if (limit) Object.assign(filters, { limit: Number(limit) })
    if (page) Object.assign(filters, { page: Number(page) })

    return filters
  }
}
