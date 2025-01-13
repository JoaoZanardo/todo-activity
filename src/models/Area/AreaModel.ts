import { Types } from 'mongoose'

import { IDeleteModelProps, IListModelsFilters, IModel, IUpdateModelProps } from '../../core/interfaces/Model'
import Model from '../../core/Model'
import { format } from '../../utils/format'
import ObjectId from '../../utils/ObjectId'

export interface IListAreasFilters extends IListModelsFilters {
  areaId?: Types.ObjectId
}

export interface IUpdateAreaProps extends IUpdateModelProps<IArea> { }

export interface IDeleteAreaProps extends IDeleteModelProps { }

export interface IFindAreaByNameProps {
  areaId?: Types.ObjectId

  name: string
  tenantId: Types.ObjectId
}

export interface IArea extends IModel {
  areaId?: Types.ObjectId
  analysis?: boolean
  description?: string
  main?: boolean

  name: string
  type: string
}

export class AreaModel extends Model<IArea> {
  private _areaId?: IArea['areaId']
  private _analysis?: IArea['analysis']
  private _description?: IArea['description']
  private _main?: IArea['main']

  private _name: IArea['name']
  private _type: IArea['type']

  constructor (area: IArea) {
    super(area)

    this._areaId = area.areaId
    this._analysis = area.analysis
    this._description = area.description
    this._main = area.main

    this._name = area.name
    this._type = area.type
  }

  get name (): IArea['name'] {
    return this._name
  }

  get areaId (): IArea['areaId'] {
    return this._areaId
  }

  get object (): IArea {
    return {
      _id: this._id,
      tenantId: this.tenantId,
      actions: this.actions,
      active: this.active,
      createdAt: this.createdAt,
      deletionDate: this.deletionDate,
      areaId: this._areaId,
      analysis: this._analysis,
      description: this._description,
      main: this._main,
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
      active,
      areaId
    }: Partial<IListAreasFilters>
  ): IListAreasFilters {
    const filters = {
      tenantId,
      deletionDate: undefined
    } as IListAreasFilters

    if (areaId) Object.assign(filters, { areaId: ObjectId(areaId) })
    if (tenantId) Object.assign(filters, { tenantId: ObjectId(tenantId) })
    if (active) Object.assign(filters, { active: format.boolean(active) })
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
