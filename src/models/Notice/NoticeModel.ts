import { Types } from 'mongoose'

import { IDeleteModelProps, IListModelsFilters, IModel, IUpdateModelProps } from '../../core/interfaces/Model'
import Model from '../../core/Model'
import { format } from '../../utils/format'
import ObjectId from '../../utils/ObjectId'

export interface IListNoticesFilters extends IListModelsFilters { }

export interface IUpdateNoticeProps extends IUpdateModelProps<INotice> { }

export interface IDeleteNoticeProps extends IDeleteModelProps { }

export interface INotice extends IModel {
  observation?: string
  initDate?: Date
  endDate?: Date
  discharged?: boolean

  title: string
  type: string
  personId: Types.ObjectId
}

export class NoticeModel extends Model<INotice> {
  private _observation?: INotice['observation']
  private _initDate?: INotice['initDate']
  private _endDate?: INotice['endDate']
  private _discharged?: INotice['discharged']

  private _title: INotice['title']
  private _type: INotice['type']
  private _personId: INotice['personId']

  constructor (notice: INotice) {
    super(notice)

    this._observation = notice.observation
    this._initDate = notice.initDate
    this._endDate = notice.endDate
    this._discharged = notice.discharged

    this._title = notice.title
    this._type = notice.type
    this._personId = notice.personId
  }

  get title (): INotice['title'] {
    return this._title
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

      title: this._title,
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
      active
    }: Partial<IListNoticesFilters>
  ): IListNoticesFilters {
    const filters = {
      tenantId,
      deletionDate: undefined
    } as IListNoticesFilters

    if (tenantId) Object.assign(filters, { tenantId: ObjectId(tenantId) })
    if (active) Object.assign(filters, { active: format.boolean(active) })
    if (search) {
      Object.assign(filters, {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { type: { $regex: search, $options: 'i' } }
        ]
      })
    }
    if (limit) Object.assign(filters, { limit: Number(limit) })
    if (page) Object.assign(filters, { page: Number(page) })

    return filters
  }
}
