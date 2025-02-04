import { Types } from 'mongoose'

import { IDeleteModelProps, IListModelsFilters, IModel, IUpdateModelProps, ModelAction } from '../../core/interfaces/Model'
import Model from '../../core/Model'
import { DateUtils } from '../../utils/Date'
import ObjectId from '../../utils/ObjectId'
import { AccessPointModel } from '../AccessPoint/AccessPointModel'
import { AccessReleaseModel } from '../AccessRelease/AccessReleaseModel'

export interface IListAccessControlsFilters extends IListModelsFilters {
  personId?: Types.ObjectId
  personTypeId?: Types.ObjectId
  type?: AccessControlType
}

export interface IUpdateAccessControlProps extends IUpdateModelProps<IAccessControl> { }

export interface IDeleteAccessControlProps extends IDeleteModelProps { }

export interface ICreateAccessControlByEquipmentIpProps {
  equipmentIp: string
  personId: Types.ObjectId
  tenantId: Types.ObjectId
}

export interface IValidateAccessControlCreationProps {
  accessRelease: AccessReleaseModel | null

  accessPoint: AccessPointModel
  tenantId: Types.ObjectId
}

export enum AccessControlType {
  'entry' = 'entry',
  'exit' = 'exit'
}

export interface IAccessControl extends IModel {
  picture?: string
  personTypeCategoryId?: Types.ObjectId

  type: AccessControlType
  personId: Types.ObjectId
  personTypeId: Types.ObjectId
  accessPointId: Types.ObjectId
  accessReleaseId: Types.ObjectId
}

export class AccessControlModel extends Model<IAccessControl> {
  private _picture?: IAccessControl['picture']
  private _personTypeCategoryId?: IAccessControl['personTypeCategoryId']

  private _type: IAccessControl['type']
  private _personId: IAccessControl['personId']
  private _personTypeId: IAccessControl['personTypeId']
  private _accessPointId: IAccessControl['accessPointId']
  private _accessReleaseId: IAccessControl['accessReleaseId']

  constructor (accessControl: IAccessControl) {
    super(accessControl)

    this._picture = accessControl.picture
    this._personTypeCategoryId = accessControl.personTypeCategoryId ? ObjectId(accessControl.personTypeCategoryId) : undefined

    this._accessPointId = ObjectId(accessControl.accessPointId)
    this._accessReleaseId = ObjectId(accessControl.accessReleaseId)
    this._type = accessControl.type
    this._personId = ObjectId(accessControl.personId)
    this._personTypeId = ObjectId(accessControl.personTypeId)
    this.actions = accessControl.actions || [{
      action: ModelAction.create,
      date: DateUtils.getCurrent()
    }]
  }

  get personId (): IAccessControl['personId'] {
    return this._personId
  }

  get accessPointId (): IAccessControl['accessPointId'] {
    return this._accessPointId
  }

  get object (): IAccessControl {
    return {
      _id: this._id,
      tenantId: this.tenantId,
      actions: this.actions,
      active: this.active,
      createdAt: this.createdAt,
      deletionDate: this.deletionDate,
      accessPointId: this._accessPointId,
      picture: this._picture,
      personTypeCategoryId: this._personTypeCategoryId,

      type: this._type,
      personId: this._personId,
      personTypeId: this._personTypeId,
      accessReleaseId: this._accessReleaseId
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
      personId,
      type
    }: Partial<IListAccessControlsFilters>
  ): IListAccessControlsFilters {
    const filters = {
      deletionDate: undefined
    } as IListAccessControlsFilters

    if (personId) Object.assign(filters, { personId: ObjectId(personId) })
    if (personTypeId) Object.assign(filters, { personTypeId: ObjectId(personTypeId) })
    if (type) Object.assign(filters, { type })
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
