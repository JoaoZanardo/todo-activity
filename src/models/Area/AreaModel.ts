import { Types } from 'mongoose'

import { IDeleteModelProps, IListModelsFilters, IModel, IUpdateModelProps } from '../../core/interfaces/Model'
import Model from '../../core/Model'
import { format } from '../../utils/format'
import ObjectId from '../../utils/ObjectId'

export interface IListAreasFilters extends IListModelsFilters { }

export interface IUpdateAreaProps extends IUpdateModelProps<IArea> { }

export interface IDeleteAreaProps extends IDeleteModelProps { }

export interface IArea extends IModel {
  accessAreasIds?: Array<Types.ObjectId>
  subAreasIds?: Array<Types.ObjectId>
  analysis?: boolean
  description?: string

  name: string
  type: string
}

export class AreaModel extends Model<IArea> {
  private _accessAreasIds?: IArea['accessAreasIds']
  private _subAreasIds?: IArea['subAreasIds']
  private _analysis?: IArea['analysis']
  private _description?: IArea['description']

  private _name: IArea['name']
  private _type: IArea['type']

  constructor (area: IArea) {
    super(area)

    this._accessAreasIds = area.accessAreasIds
    this._subAreasIds = area.subAreasIds
    this._analysis = area.analysis
    this._description = area.description

    this._name = area.name
    this._type = area.type
  }

  get name (): IArea['name'] {
    return this._name
  }

  get object (): IArea {
    return {
      _id: this._id,
      tenantId: this.tenantId,
      actions: this.actions,
      active: this.active,
      createdAt: this.createdAt,
      deletionDate: this.deletionDate,
      accessAreasIds: this._accessAreasIds,
      subAreasIds: this._subAreasIds,
      analysis: this._analysis,
      description: this._description,
      name: this._name,
      type: this._type
    }
  }

  get show (): IArea {
    return this.object
  }

  static listFilters (
    {
      tenantId,
      search,
      limit,
      page,
      active
    }: Partial<IListAreasFilters>
  ): IListAreasFilters {
    const filters = {
      tenantId,
      deletionDate: undefined
    } as IListAreasFilters

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
