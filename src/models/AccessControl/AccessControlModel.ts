import { Types } from 'mongoose'

import { IDeleteModelProps, IListModelsFilters, IModel, IUpdateModelProps, ModelAction } from '../../core/interfaces/Model'
import Model from '../../core/Model'
import { DateUtils } from '../../utils/Date'
import ObjectId from '../../utils/ObjectId'

export interface IListAccessControlsFilters extends IListModelsFilters {
  personId?: Types.ObjectId
  personTypeId?: Types.ObjectId
  personCategoryId?: Types.ObjectId
}

export interface IUpdateAccessControlProps extends IUpdateModelProps<IAccessControl> { }

export interface IDeleteAccessControlProps extends IDeleteModelProps { }

export enum AccessControlType {
  'entry' = 'entry',
  'exit' = 'exit'
}

export enum AccessRelease {
  manually = 'manually',
  facial = 'facial',
  qrCode = 'qrCode'
}

export interface IAccessControl extends IModel {
  personTypeCategoryId?: Types.ObjectId
  responsibleId?: Types.ObjectId
  observation?: string

  type: AccessControlType
  personId: Types.ObjectId
  personTypeId: Types.ObjectId
  accessRealese: AccessRelease
}

export class AccessControlModel extends Model<IAccessControl> {
  private _personTypeCategoryId?: IAccessControl['personTypeCategoryId']
  private _responsibleId?: IAccessControl['responsibleId']
  private _observation?: IAccessControl['observation']

  private _type: IAccessControl['type']
  private _personId: IAccessControl['personId']
  private _personTypeId: IAccessControl['personTypeId']
  private _accessRealese: IAccessControl['accessRealese']

  constructor (accessControl: IAccessControl) {
    super(accessControl)

    this._personTypeCategoryId = accessControl.personTypeCategoryId
    this._responsibleId = accessControl.responsibleId
    this._observation = accessControl.observation

    this._type = accessControl.type
    this._personId = accessControl.personId
    this._personTypeId = accessControl.personTypeId
    this._accessRealese = accessControl.accessRealese
    this.actions = accessControl.actions || [{
      action: ModelAction.create,
      date: DateUtils.getCurrent()
    }]
  }

  get object (): IAccessControl {
    return {
      _id: this._id,
      tenantId: this.tenantId,
      actions: this.actions,
      active: this.active,
      createdAt: this.createdAt,
      deletionDate: this.deletionDate,
      personTypeCategoryId: this._personTypeCategoryId,
      responsibleId: this._responsibleId,
      observation: this._observation,

      type: this._type,
      personId: this._personId,
      personTypeId: this._personTypeId,
      accessRealese: this._accessRealese
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
      personTypeId
    }: Partial<IListAccessControlsFilters>
  ): IListAccessControlsFilters {
    const filters = {
      deletionDate: undefined
    } as IListAccessControlsFilters

    if (personTypeId) Object.assign(filters, { personTypeId: ObjectId(personTypeId) })
    if (tenantId) Object.assign(filters, { tenantId: ObjectId(tenantId) })
    if (search) {
      Object.assign(filters, {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      })
    }
    if (limit) Object.assign(filters, { limit: Number(limit) })
    if (page) Object.assign(filters, { page: Number(page) })

    return filters
  }
}
