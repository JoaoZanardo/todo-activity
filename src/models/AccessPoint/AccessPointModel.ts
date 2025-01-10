import { Types } from 'mongoose'

import { IDeleteModelProps, IListModelsFilters, IModel, IUpdateModelProps } from '../../core/interfaces/Model'
import Model from '../../core/Model'
import { format } from '../../utils/format'
import ObjectId from '../../utils/ObjectId'

export interface IListAccessPointsFilters extends IListModelsFilters { }

export interface IUpdateAccessPointProps extends IUpdateModelProps<IAccessPoint> { }

export interface IDeleteAccessPointProps extends IDeleteModelProps { }

export interface IFindAccessPointByNameProps {
  areaId?: Types.ObjectId
  accessAreaId?: Types.ObjectId

  name: string
  tenantId: Types.ObjectId
}

export interface IAccessPoint extends IModel {
  generalExit?: boolean
  areaId?: Types.ObjectId
  accessAreaId?: Types.ObjectId

  name: string
  accessType: string
  equipmentsIds: Array<Types.ObjectId>
  personTypesIds: Array<Types.ObjectId>
}

export class AccessPointModel extends Model<IAccessPoint> {
  private _generalExit?: IAccessPoint['generalExit']
  private _areaId?: IAccessPoint['areaId']
  private _accessAreaId?: IAccessPoint['accessAreaId']

  private _name: IAccessPoint['name']
  private _accessType: IAccessPoint['accessType']
  private _equipmentsIds: IAccessPoint['equipmentsIds']
  private _personTypesIds: IAccessPoint['personTypesIds']

  constructor (accessPoint: IAccessPoint) {
    super(accessPoint)

    this._generalExit = accessPoint.generalExit
    this._areaId = accessPoint.areaId
    this._accessAreaId = accessPoint.accessAreaId

    this._name = accessPoint.name
    this._accessType = accessPoint.accessType
    this._equipmentsIds = accessPoint.equipmentsIds
    this._personTypesIds = accessPoint.personTypesIds
  }

  get areaId (): IAccessPoint['areaId'] {
    return this._areaId
  }

  get accessAreaId (): IAccessPoint['accessAreaId'] {
    return this._accessAreaId
  }

  get object (): IAccessPoint {
    return {
      _id: this._id,
      tenantId: this.tenantId,
      actions: this.actions,
      active: this.active,
      createdAt: this.createdAt,
      deletionDate: this.deletionDate,
      equipmentsIds: this._equipmentsIds,
      name: this._name,
      personTypesIds: this._personTypesIds,
      generalExit: this._generalExit,
      accessType: this._accessType,
      accessAreaId: this._accessAreaId,
      areaId: this._areaId
    }
  }

  get name (): IAccessPoint['name'] {
    return this._name
  }

  get show (): IAccessPoint {
    return this.object
  }

  static listFilters (
    {
      tenantId,
      search,
      limit,
      page,
      active
    }: Partial<IListAccessPointsFilters>
  ): IListAccessPointsFilters {
    const filters = {
      tenantId,
      deletionDate: undefined
    } as IListAccessPointsFilters

    if (tenantId) Object.assign(filters, { tenantId: ObjectId(tenantId) })
    if (active) Object.assign(filters, { active: format.boolean(active) })
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
