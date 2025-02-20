import { Types } from 'mongoose'

import { IDeleteModelProps, IListModelsFilters, IModel, IUpdateModelProps, ModelAction } from '../../core/interfaces/Model'
import Model from '../../core/Model'
import { DateUtils } from '../../utils/Date'
import ObjectId from '../../utils/ObjectId'

export interface IListAccessReleaseInvitationsFilters extends IListModelsFilters {
  status: AccessReleaseInvitationStatus
}

export interface IUpdateAccessReleaseInvitationProps extends IUpdateModelProps<IAccessReleaseInvitation> { }

export interface IDeleteAccessReleaseInvitationProps extends IDeleteModelProps { }

export enum AccessReleaseInvitationStatus {
  filled = 'filled',
  expired = 'expired',
  pending = 'pending'
}

export interface IAccessReleaseInvitation extends IModel {
  observation?: string
  status?: AccessReleaseInvitationStatus
  accessReleaseId?: Types.ObjectId
  groupId?: Types.ObjectId

  initDate: Date
  endDate: Date
  areaId: Types.ObjectId
}

export class AccessReleaseInvitationModel extends Model<IAccessReleaseInvitation> {
  private _observation?: IAccessReleaseInvitation['observation']
  private _status?: IAccessReleaseInvitation['status']
  private _accessReleaseId?: IAccessReleaseInvitation['accessReleaseId']
  private _groupId?: IAccessReleaseInvitation['groupId']

  private _initDate: IAccessReleaseInvitation['initDate']
  private _endDate: IAccessReleaseInvitation['endDate']
  private _areaId: IAccessReleaseInvitation['areaId']

  constructor (accessReleaseInvitation: IAccessReleaseInvitation) {
    super(accessReleaseInvitation)

    this._observation = accessReleaseInvitation.observation
    this._status = accessReleaseInvitation.status
    this._accessReleaseId = accessReleaseInvitation.accessReleaseId
    this._groupId = accessReleaseInvitation.groupId

    this._initDate = accessReleaseInvitation.initDate
    this._endDate = accessReleaseInvitation.endDate
    this._areaId = accessReleaseInvitation.areaId
    this.actions = accessReleaseInvitation.actions || [{
      action: ModelAction.create,
      date: DateUtils.getCurrent()
    }]
  }

  get status (): IAccessReleaseInvitation['status'] {
    return this._status
  }

  get object (): IAccessReleaseInvitation {
    return {
      _id: this._id,
      tenantId: this.tenantId,
      actions: this.actions,
      active: this.active,
      createdAt: this.createdAt,
      deletionDate: this.deletionDate,
      observation: this._observation,
      status: this._status,
      accessReleaseId: this._accessReleaseId,
      groupId: this._groupId,

      initDate: this._initDate,
      endDate: this._endDate,
      areaId: this._areaId
    }
  }

  get show () {
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
      status
    }: Partial<IListAccessReleaseInvitationsFilters>
  ): IListAccessReleaseInvitationsFilters {
    const filters = {
      deletionDate: undefined
    } as IListAccessReleaseInvitationsFilters

    if (status) Object.assign(filters, { status })
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
