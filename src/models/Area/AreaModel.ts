import { IDeleteModelProps, IListModelsFilters, IModel, IUpdateModelProps } from '../../core/interfaces/Model'
import Model from '../../core/Model'
import { format } from '../../utils/format'
import ObjectId from '../../utils/ObjectId'

export interface IListAreasFilters extends IListModelsFilters { }

export interface IUpdateAreaProps extends IUpdateModelProps<IArea> {}

export interface IDeleteAreaProps extends IDeleteModelProps { }

export interface IArea extends IModel {
  // accessAreas?: Array<IAccessArea>
  subAreas?: Array<IArea>

  name: string
}

export class AreaModel extends Model<IArea> {
  private _serialNumber?: IArea['serialNumber']
  private _description?: IArea['description']

  private _name: IArea['name']
  private _pattern: IArea['pattern']
  private _ip: IArea['ip']

  constructor (area: IArea) {
    super(area)

    this._serialNumber = area.serialNumber
    this._description = area.description

    this._name = area.name
    this._pattern = area.pattern
    this._ip = area.ip
  }

  get ip (): IArea['ip'] {
    return this._ip
  }

  get object (): IArea {
    return {
      _id: this._id,
      tenantId: this.tenantId,
      actions: this.actions,
      active: this.active,
      createdAt: this.createdAt,
      deletionDate: this.deletionDate,
      pattern: this._pattern,
      serialNumber: this._serialNumber,
      ip: this._ip,
      description: this._description,
      name: this._name
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
          { ip: { $regex: search, $options: 'i' } }
        ]
      })
    }
    if (limit) Object.assign(filters, { limit: Number(limit) })
    if (page) Object.assign(filters, { page: Number(page) })

    return filters
  }
}
