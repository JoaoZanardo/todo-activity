import { Types } from 'mongoose'

import { IDeleteModelProps, IListModelsFilters, IModel, IUpdateModelProps } from '../../core/interfaces/Model'
import Model from '../../core/Model'
import { format } from '../../utils/format'
import ObjectId from '../../utils/ObjectId'

export interface IListAccessAreasFilters extends IListModelsFilters {
  areaId?: Types.ObjectId
}

export interface IUpdateAccessAreaProps extends IUpdateModelProps<IAccessArea> { }

export interface IDeleteAccessAreaProps extends IDeleteModelProps { }

export interface IFindAccessAreaByNameProps {
  areaId?: Types.ObjectId

  name: string
  tenantId: Types.ObjectId
}

export interface IAccessArea extends IModel {
  description?: string

  name: string
  areaId: Types.ObjectId
}

export class AccessAreaModel extends Model<IAccessArea> {
  private _description?: IAccessArea['description']

  private _name: IAccessArea['name']
  private _areaId: IAccessArea['areaId']

  constructor (accessArea: IAccessArea) {
    super(accessArea)

    this._description = accessArea.description

    this._name = accessArea.name
    this._areaId = accessArea.areaId
  }

  get name (): IAccessArea['name'] {
    return this._name
  }

  get areaId (): IAccessArea['areaId'] {
    return this._areaId
  }

  get object (): IAccessArea {
    return {
      _id: this._id,
      tenantId: this.tenantId,
      actions: this.actions,
      active: this.active,
      createdAt: this.createdAt,
      deletionDate: this.deletionDate,
      areaId: this._areaId,
      description: this._description,
      name: this._name
    }
  }

  get show (): IAccessArea {
    return this.object
  }

  static listFilters (
    {
      tenantId,
      search,
      limit,
      page,
      active,
      areaId
    }: Partial<IListAccessAreasFilters>
  ): IListAccessAreasFilters {
    const filters = {
      tenantId,
      deletionDate: undefined
    } as IListAccessAreasFilters

    if (tenantId) Object.assign(filters, { tenantId: ObjectId(tenantId) })
    if (areaId) Object.assign(filters, { areaId: ObjectId(areaId) })
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
