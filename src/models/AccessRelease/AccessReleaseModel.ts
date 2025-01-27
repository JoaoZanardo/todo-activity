import { Types } from 'mongoose'
import { ExpiringTime } from 'src/models/PersonType/PersonTypeModel'

import { IDeleteModelProps, IListModelsFilters, IModel, IUpdateModelProps, ModelAction } from '../../core/interfaces/Model'
import Model from '../../core/Model'
import { DateUtils } from '../../utils/Date'
import ObjectId from '../../utils/ObjectId'

export interface IListAccessReleasesFilters extends IListModelsFilters {
  personId?: Types.ObjectId
  personTypeId?: Types.ObjectId
}

export interface IUpdateAccessReleaseProps extends IUpdateModelProps<IAccessRelease> { }

export interface IDeleteAccessReleaseProps extends IDeleteModelProps { }

export enum AccessRelease {
  manually = 'manually',
  facial = 'facial',
  qrCode = 'qrCode'
}

export interface IAccessRelease extends IModel {
  responsibleId?: Types.ObjectId
  observation?: string
  picture?: string
  type?: AccessRelease
  expiringTime?: ExpiringTime
  singleAccess?: boolean

  personId: Types.ObjectId
  personTypeId: Types.ObjectId
  areasIds: Array<Types.ObjectId>
  accessPointId: Types.ObjectId
}

export class AccessReleaseModel extends Model<IAccessRelease> {
  private _responsibleId?: IAccessRelease['responsibleId']
  private _observation?: IAccessRelease['observation']
  private _picture?: IAccessRelease['picture']
  private _type?: IAccessRelease['type']
  private _expiringTime?: IAccessRelease['expiringTime']
  private _singleAccess?: IAccessRelease['singleAccess']

  private _personId: IAccessRelease['personId']
  private _personTypeId: IAccessRelease['personTypeId']
  private _areasIds: IAccessRelease['areasIds']
  private _accessPointId: IAccessRelease['accessPointId']

  constructor (accessRelease: IAccessRelease) {
    super(accessRelease)

    this._responsibleId = accessRelease.responsibleId ? ObjectId(accessRelease.responsibleId) : undefined
    this._observation = accessRelease.observation
    this._picture = accessRelease.picture
    this._expiringTime = accessRelease.expiringTime
    this._singleAccess = accessRelease.singleAccess

    this._accessPointId = ObjectId(accessRelease.accessPointId)
    this._type = accessRelease.type
    this._personId = ObjectId(accessRelease.personId)
    this._personTypeId = ObjectId(accessRelease.personTypeId)
    this._areasIds = accessRelease.areasIds.map(areaId => ObjectId(areaId))
    this._observation = accessRelease.observation
    this.actions = accessRelease.actions || [{
      action: ModelAction.create,
      date: DateUtils.getCurrent()
    }]
  }

  get personId (): IAccessRelease['personId'] {
    return this._personId
  }

  get accessPointId (): IAccessRelease['accessPointId'] {
    return this._accessPointId
  }

  get areasIds (): IAccessRelease['areasIds'] {
    return this._areasIds
  }

  get object (): IAccessRelease {
    return {
      _id: this._id,
      tenantId: this.tenantId,
      actions: this.actions,
      active: this.active,
      createdAt: this.createdAt,
      deletionDate: this.deletionDate,
      responsibleId: this._responsibleId,
      observation: this._observation,
      areasIds: this._areasIds,
      accessPointId: this._accessPointId,
      picture: this._picture,
      expiringTime: this._expiringTime,
      singleAccess: this._singleAccess,

      type: this._type,
      personId: this._personId,
      personTypeId: this._personTypeId
    }
  }

  get show () {
    return this.object
  }

  static listFilters (
    {
      search,
      limit,
      page,
      tenantId,
      personTypeId,
      personId
    }: Partial<IListAccessReleasesFilters>
  ): IListAccessReleasesFilters {
    const filters = {
      deletionDate: undefined
    } as IListAccessReleasesFilters

    if (personId) Object.assign(filters, { personId: ObjectId(personId) })
    if (personTypeId) Object.assign(filters, { personTypeId: ObjectId(personTypeId) })
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
