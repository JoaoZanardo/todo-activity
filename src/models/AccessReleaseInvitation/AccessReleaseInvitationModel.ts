import { Types } from 'mongoose'

import { IDeleteModelProps, IListModelsFilters, IModel, IUpdateModelProps, ModelAction } from '../../core/interfaces/Model'
import Model from '../../core/Model'
import { DateUtils } from '../../utils/Date'
import ObjectId from '../../utils/ObjectId'
import { IAccessReleaseInvitationGroup } from '../AccessReleaseInvitationGroup/AccessReleaseInvitationGroupModel'
import { IArea } from '../Area/AreaModel'
import { IPerson } from '../Person/PersonModel'
import { ITenant } from '../Tenant/TenantModel'

export interface IListAccessReleaseInvitationsFilters extends IListModelsFilters {
  status?: AccessReleaseInvitationStatus
  personId?: Types.ObjectId
  accessReleaseInvitationGroupId?: Types.ObjectId
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
  accessReleaseInvitationGroupId?: Types.ObjectId
  guestName?: string
  guestPhone?: string
  guestId?: Types.ObjectId

  guest?: IPerson
  tenant?: ITenant
  person?: IPerson
  area?: IArea
  accessReleaseInvitationGroup?: IAccessReleaseInvitationGroup

  initDate: Date
  endDate: Date
  areaId: Types.ObjectId
  personId: Types.ObjectId
}

export class AccessReleaseInvitationModel extends Model<IAccessReleaseInvitation> {
  private _observation?: IAccessReleaseInvitation['observation']
  private _status?: IAccessReleaseInvitation['status']
  private _accessReleaseInvitationGroupId?: IAccessReleaseInvitation['accessReleaseInvitationGroupId']
  private _guestName?: IAccessReleaseInvitation['guestName']
  private _guestPhone?: IAccessReleaseInvitation['guestName']
  private _guestId?: IAccessReleaseInvitation['guestId']

  private _guest?: IAccessReleaseInvitation['guest']
  private _person?: IAccessReleaseInvitation['person']
  private _area?: IAccessReleaseInvitation['area']
  private _tenant?: IAccessReleaseInvitation['tenant']
  private _accessReleaseInvitationGroup?: IAccessReleaseInvitation['accessReleaseInvitationGroup']

  private _initDate: IAccessReleaseInvitation['initDate']
  private _endDate: IAccessReleaseInvitation['endDate']
  private _areaId: IAccessReleaseInvitation['areaId']
  private _personId: IAccessReleaseInvitation['personId']

  constructor (accessReleaseInvitation: IAccessReleaseInvitation) {
    super(accessReleaseInvitation)

    this._observation = accessReleaseInvitation.observation
    this._status = accessReleaseInvitation.status
    this._accessReleaseInvitationGroupId = accessReleaseInvitation.accessReleaseInvitationGroupId ? ObjectId(accessReleaseInvitation.accessReleaseInvitationGroupId) : undefined
    this._guestName = accessReleaseInvitation.guestName
    this._guestPhone = accessReleaseInvitation.guestPhone
    this._guestId = accessReleaseInvitation.guestId ? ObjectId(accessReleaseInvitation.guestId) : undefined

    this._guest = accessReleaseInvitation.guest
    this._tenant = accessReleaseInvitation.tenant
    this._area = accessReleaseInvitation.area
    this._person = accessReleaseInvitation.person
    this._accessReleaseInvitationGroup = accessReleaseInvitation.accessReleaseInvitationGroup

    this._initDate = accessReleaseInvitation.initDate
    this._endDate = accessReleaseInvitation.endDate
    this._areaId = ObjectId(accessReleaseInvitation.areaId)
    this._personId = ObjectId(accessReleaseInvitation.personId)
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
      accessReleaseInvitationGroupId: this._accessReleaseInvitationGroupId,
      guestName: this._guestName,
      guestPhone: this._guestPhone,
      guestId: this._guestId,

      initDate: this._initDate,
      endDate: this._endDate,
      areaId: this._areaId,
      personId: this._personId
    }
  }

  get show (): IAccessReleaseInvitation {
    return {
      ...this.object,
      guest: this._guest,
      tenant: this._tenant,
      accessReleaseInvitationGroup: this._accessReleaseInvitationGroup,
      person: this._person,
      area: this._area
    }
  }

  static listFilters (
    {
      search,
      limit,
      page,
      tenantId,
      status,
      personId,
      accessReleaseInvitationGroupId
    }: Partial<IListAccessReleaseInvitationsFilters>
  ): IListAccessReleaseInvitationsFilters {
    const filters = {
      deletionDate: undefined,
      accessReleaseInvitationGroupId: undefined
    } as IListAccessReleaseInvitationsFilters

    if (accessReleaseInvitationGroupId) Object.assign(filters, { accessReleaseInvitationGroupId: ObjectId(accessReleaseInvitationGroupId) })
    if (status) Object.assign(filters, { status })
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
