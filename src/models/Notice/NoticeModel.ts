import { Types } from 'mongoose'

import { IDeleteModelProps, IListModelsFilters, IModel, IUpdateModelProps } from '../../core/interfaces/Model'
import Model from '../../core/Model'
import { format } from '../../utils/format'
import ObjectId from '../../utils/ObjectId'

export interface IListNoticesFilters extends IListModelsFilters {
  personId: Types.ObjectId
  areaId: Types.ObjectId
  type: NoticeType
}

export interface IUpdateNoticeProps extends IUpdateModelProps<INotice> { }

export interface IDeleteNoticeProps extends IDeleteModelProps { }

export enum NoticeType {
  service = 'service',
  delivery = 'delivery'
}

export interface INotice extends IModel {
  observation?: string
  initDate?: Date
  endDate?: Date
  discharged?: boolean
  servicetype?: string
  serviceProviderName?: string
  deliveryType?: string

  type: NoticeType
  personId: Types.ObjectId
  areaId: Types.ObjectId
}

export class NoticeModel extends Model<INotice> {
  private _observation?: INotice['observation']
  private _initDate?: INotice['initDate']
  private _endDate?: INotice['endDate']
  private _discharged?: INotice['discharged']
  private _servicetype?: INotice['servicetype']
  private _serviceProviderName?: INotice['serviceProviderName']
  private _deliveryType?: INotice['deliveryType']

  private _type: INotice['type']
  private _personId: INotice['personId']
  private _areaId: INotice['areaId']

  constructor (notice: INotice) {
    super(notice)

    this._observation = notice.observation
    this._initDate = notice.initDate
    this._endDate = notice.endDate
    this._discharged = notice.discharged
    this._servicetype = notice.servicetype
    this._serviceProviderName = notice.serviceProviderName
    this._deliveryType = notice.deliveryType

    this._type = notice.type
    this._personId = ObjectId(notice.personId)
    this._areaId = ObjectId(notice.areaId)
  }

  get areaId (): INotice['areaId'] {
    return this._areaId
  }

  get object (): INotice {
    return {
      _id: this._id,
      tenantId: this.tenantId,
      actions: this.actions,
      active: this.active,
      createdAt: this.createdAt,
      deletionDate: this.deletionDate,
      observation: this._observation,
      initDate: this._initDate,
      endDate: this._endDate,
      discharged: this._discharged,
      deliveryType: this._deliveryType,
      serviceProviderName: this._serviceProviderName,
      servicetype: this._servicetype,

      areaId: this._areaId,
      type: this._type,
      personId: this._personId
    }
  }

  get show (): INotice {
    return {
      ...this.object
    }
  }

  static listFilters (
    {
      tenantId,
      search,
      limit,
      page,
      active,
      areaId,
      personId,
      type
    }: Partial<IListNoticesFilters>
  ): IListNoticesFilters {
    const filters = {
      tenantId,
      deletionDate: undefined
    } as IListNoticesFilters

    if (areaId) Object.assign(filters, { areaId: ObjectId(areaId) })
    if (personId) Object.assign(filters, { personId: ObjectId(personId) })
    if (type) Object.assign(filters, { type })
    if (tenantId) Object.assign(filters, { tenantId: ObjectId(tenantId) })
    if (active) Object.assign(filters, { active: format.boolean(active) })
    if (search) {
      Object.assign(filters, {
        $or: [
          { observation: { $regex: search, $options: 'i' } },
          { servicetype: { $regex: search, $options: 'i' } },
          { serviceProviderName: { $regex: search, $options: 'i' } },
          { deliveryType: { $regex: search, $options: 'i' } }
        ]
      })
    }
    if (limit) Object.assign(filters, { limit: Number(limit) })
    if (page) Object.assign(filters, { page: Number(page) })

    return filters
  }
}
