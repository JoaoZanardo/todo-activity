import { Types } from 'mongoose'

import { IDeleteModelProps, IListModelsFilters, IModel, IUpdateModelProps } from '../../core/interfaces/Model'
import Model from '../../core/Model'
import { format } from '../../utils/format'
import ObjectId from '../../utils/ObjectId'

export interface IListAccessAreasFilters extends IListModelsFilters { }

export interface IUpdateAccessAreaProps extends IUpdateModelProps<IAccessArea> { }

export interface IDeleteAccessAreaProps extends IDeleteModelProps { }

export interface IAccessArea extends IModel {
  description?: string
  accessPointsIds?: Array<Types.ObjectId>

  name: string
}

export class AccessAreaModel extends Model<IAccessArea> {
  private _accessPointsIds?: IAccessArea['accessPointsIds']
  private _description?: IAccessArea['description']

  private _name: IAccessArea['name']

  constructor (accessArea: IAccessArea) {
    super(accessArea)

    this._accessPointsIds = accessArea.accessPointsIds
    this._description = accessArea.description

    this._name = accessArea.name
  }

  get name (): IAccessArea['name'] {
    return this._name
  }

  get object (): IAccessArea {
    return {
      _id: this._id,
      tenantId: this.tenantId,
      actions: this.actions,
      active: this.active,
      createdAt: this.createdAt,
      deletionDate: this.deletionDate,
      accessPointsIds: this._accessPointsIds,
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
      active
    }: Partial<IListAccessAreasFilters>
  ): IListAccessAreasFilters {
    const filters = {
      tenantId,
      deletionDate: undefined
    } as IListAccessAreasFilters

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
