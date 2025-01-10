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
  description?: string

  name: string
  pattern: IEquipmentPattern
  ip: string
}

export class EquipmentModel extends Model<IEquipment> {
  private _serialNumber?: IEquipment['serialNumber']
  private _description?: IEquipment['description']

  private _name: IEquipment['name']
  private _pattern: IEquipment['pattern']
  private _ip: IEquipment['ip']

  constructor (equipment: IEquipment) {
    super(equipment)

    this._serialNumber = equipment.serialNumber
    this._description = equipment.description

    this._name = equipment.name
    this._pattern = equipment.pattern
    this._ip = equipment.ip
  }

  get ip (): IEquipment['ip'] {
    return this._ip
  }

  get name (): IEquipment['name'] {
    return this._name
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
      description: this._description,
      name: this._name
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
