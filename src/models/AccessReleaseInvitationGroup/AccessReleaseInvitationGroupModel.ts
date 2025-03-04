import { Types } from 'mongoose'

import { IDeleteModelProps, IListModelsFilters, IModel, IUpdateModelProps, ModelAction } from '../../core/interfaces/Model'
import Model from '../../core/Model'
import { IPerson } from '../../models/Person/PersonModel'
import { DateUtils } from '../../utils/Date'
import { format } from '../../utils/format'
import ObjectId from '../../utils/ObjectId'

export interface IListAccessReleaseInvitationGroupsFilters extends IListModelsFilters {
  personId?: Types.ObjectId
  today?: boolean
}

export interface IUpdateAccessReleaseInvitationGroupProps extends IUpdateModelProps<IAccessReleaseInvitationGroup> { }

export interface IDeleteAccessReleaseInvitationGroupProps extends IDeleteModelProps { }

export interface IFindAccessReleaseInvitationGroupByTitle {
  title: string
  tenantId: Types.ObjectId
 }

export interface IAccessReleaseInvitationGroup extends IModel {
  description?: string
  expired?: boolean

  person?: IPerson

  title: string
  areaId: string
  initDate: Date
  endDate: Date
  personId: Types.ObjectId
}

export class AccessReleaseInvitationGroupModel extends Model<IAccessReleaseInvitationGroup> {
  private _description?: IAccessReleaseInvitationGroup['description']
  private _expired?: IAccessReleaseInvitationGroup['expired']

  private _person?: IAccessReleaseInvitationGroup['person']

  private _title: IAccessReleaseInvitationGroup['title']
  private _areaId: IAccessReleaseInvitationGroup['areaId']
  private _initDate: IAccessReleaseInvitationGroup['initDate']
  private _endDate: IAccessReleaseInvitationGroup['endDate']
  private _personId: IAccessReleaseInvitationGroup['personId']

  constructor (accessReleaseInvitationGroup: IAccessReleaseInvitationGroup) {
    super(accessReleaseInvitationGroup)

    this._description = accessReleaseInvitationGroup.description
    this._expired = accessReleaseInvitationGroup.expired

    this._person = accessReleaseInvitationGroup.person

    this._title = accessReleaseInvitationGroup.title
    this._areaId = accessReleaseInvitationGroup.areaId
    this._initDate = accessReleaseInvitationGroup.initDate
    this._endDate = accessReleaseInvitationGroup.endDate
    this._personId = accessReleaseInvitationGroup.personId
    this.actions = accessReleaseInvitationGroup.actions || [{
      action: ModelAction.create,
      date: DateUtils.getCurrent()
    }]
  }

  get title (): IAccessReleaseInvitationGroup['title'] {
    return this._title
  }

  get object (): IAccessReleaseInvitationGroup {
    return {
      _id: this._id,
      tenantId: this.tenantId,
      actions: this.actions,
      active: this.active,
      createdAt: this.createdAt,
      deletionDate: this.deletionDate,
      description: this._description,
      expired: this._expired,

      title: this._title,
      areaId: this._areaId,
      initDate: this._initDate,
      endDate: this._endDate,
      personId: this._personId
    }
  }

  get show (): IAccessReleaseInvitationGroup {
    return {
      ...this.object,
      person: this._person
    }
  }

  static listFilters (
    {
      search,
      limit,
      page,
      tenantId,
      personId,
      today
    }: Partial<IListAccessReleaseInvitationGroupsFilters>
  ): IListAccessReleaseInvitationGroupsFilters {
    const filters = {
      deletionDate: undefined
    } as IListAccessReleaseInvitationGroupsFilters

    const parsedToday = format.boolean(today)

    if (parsedToday) {
      const startOfDay = new Date()
      startOfDay.setHours(0, 0, 0, 0)

      const endOfDay = new Date()
      endOfDay.setHours(23, 59, 59, 999)

      const createdAtFilter: any = {}

      createdAtFilter.$gte = DateUtils.parse(startOfDay)
      createdAtFilter.$lte = DateUtils.parse(endOfDay)
    }

    if (personId) Object.assign(filters, { personId: ObjectId(personId) })
    if (tenantId) Object.assign(filters, { tenantId: ObjectId(tenantId) })
    if (search) {
      Object.assign(filters, {
        $or: [
          { observation: { $regex: search, $options: 'i' } }
        ]
      })
    }
    if (limit) Object.assign(filters, { limit: Number(limit) })
    if (page) Object.assign(filters, { page: Number(page) })

    return filters
  }
}
