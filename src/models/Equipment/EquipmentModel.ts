import { Types } from 'mongoose'

import { IDeleteModelProps, IListModelsFilters, IModel, IUpdateModelProps } from '../../core/interfaces/Model'
import Model from '../../core/Model'
import { format } from '../../utils/format'
import ObjectId from '../../utils/ObjectId'

export interface IListEquipmentsFilters extends IListModelsFilters { }

export interface IUpdateEquipmentProps extends IUpdateModelProps<IEquipment> {}

export interface IDeleteEquipmentProps extends IDeleteModelProps { }

export interface IFindEquipmentByIpProps {
  ip: string
  tenantId: Types.ObjectId
}

export interface IEquipmentPattern {
  code: string
  type: string
  brand: string
  name: string
  firmwares: Array<string>
}

export interface IEquipment extends IModel {
  serialNumber?: string

  pattern: IEquipmentPattern
  ip: string
  description: string
}

export class EquipmentModel extends Model<IEquipment> {
  private _serialNumber?: IEquipment['serialNumber']

  private _pattern: IEquipment['pattern']
  private _ip: IEquipment['ip']
  private _description: IEquipment['description']

  constructor (equipment: IEquipment) {
    super(equipment)

    this._serialNumber = equipment.serialNumber

    this._pattern = equipment.pattern
    this._ip = equipment.ip
    this._description = equipment.description
  }

  get ip (): IEquipment['ip'] {
    return this._ip
  }

  get object (): IEquipment {
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
      description: this._description
    }
  }

  get show (): IEquipment {
    return this.object
  }

  static listFilters (
    {
      tenantId,
      search,
      limit,
      page,
      active
    }: Partial<IListEquipmentsFilters>
  ): IListEquipmentsFilters {
    const filters = {
      tenantId,
      deletionDate: undefined
    } as IListEquipmentsFilters

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
