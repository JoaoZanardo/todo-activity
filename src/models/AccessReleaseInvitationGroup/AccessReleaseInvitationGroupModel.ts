import { Types } from 'mongoose'

import { IDeleteModelProps, IListModelsFilters, IModel, IUpdateModelProps, ModelAction } from '../../core/interfaces/Model'
import Model from '../../core/Model'
import { DateUtils } from '../../utils/Date'
import ObjectId from '../../utils/ObjectId'

export interface IListAccessReleaseInvitationGroupsFilters extends IListModelsFilters {
  personId?: Types.ObjectId
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

  title: string
  areaId: string
  initDate: Date
  endDate: Date
  personId: Types.ObjectId
}

export class AccessReleaseInvitationGroupModel extends Model<IAccessReleaseInvitationGroup> {
  private _description?: IAccessReleaseInvitationGroup['description']
  private _expired?: IAccessReleaseInvitationGroup['expired']

  private _title: IAccessReleaseInvitationGroup['title']
  private _areaId: IAccessReleaseInvitationGroup['areaId']
  private _initDate: IAccessReleaseInvitationGroup['initDate']
  private _endDate: IAccessReleaseInvitationGroup['endDate']
  private _personId: IAccessReleaseInvitationGroup['personId']

  constructor (accessReleaseInvitationGroup: IAccessReleaseInvitationGroup) {
    super(accessReleaseInvitationGroup)

    this._description = accessReleaseInvitationGroup.description
    this._expired = accessReleaseInvitationGroup.expired

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
      ...this.object
    }
  }

  static listFilters (
    {
      search,
      limit,
      page,
      tenantId,
      personId
    }: Partial<IListAccessReleaseInvitationGroupsFilters>
  ): IListAccessReleaseInvitationGroupsFilters {
    const filters = {
      deletionDate: undefined
    } as IListAccessReleaseInvitationGroupsFilters

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
