import { Types } from 'mongoose'

import { IDeleteModelProps, IListModelsFilters, IModel, IUpdateModelProps } from '../../core/interfaces/Model'
import Model from '../../core/Model'
import { format } from '../../utils/format'
import ObjectId from '../../utils/ObjectId'

export interface IListVehiclesFilters extends IListModelsFilters {
  personId?: Types.ObjectId
}

export interface IUpdateVehicleProps extends IUpdateModelProps<IVehicle> { }

export interface IDeleteVehicleProps extends IDeleteModelProps { }

export interface IVehicle extends IModel {
  description?: string
  brand?: string
  model?: string
  color?: string
  chassis?: string
  factoryVin?: string
  detranVin?: string
  manufactureYear?: string
  modelYear?: string
  type?: string
  gasGrade?: string

  plate: string
  personId: Types.ObjectId
}

export class VehicleModel extends Model<IVehicle> {
  private _description?: IVehicle['description']
  private _brand?: IVehicle['brand']
  private _model?: IVehicle['model']
  private _color?: IVehicle['color']
  private _chassis?: IVehicle['chassis']
  private _factoryVin?: IVehicle['factoryVin']
  private _detranVin?: IVehicle['detranVin']
  private _manufactureYear?: IVehicle['manufactureYear']
  private _modelYear?: IVehicle['modelYear']
  private _type?: IVehicle['type']
  private _gasGrade?: IVehicle['gasGrade']

  private _plate: IVehicle['plate']
  private _personId: IVehicle['personId']

  constructor (vehicle: IVehicle) {
    super(vehicle)

    this._description = vehicle.description
    this._brand = vehicle.brand
    this._model = vehicle.model
    this._color = vehicle.color
    this._chassis = vehicle.chassis
    this._factoryVin = vehicle.factoryVin
    this._detranVin = vehicle.detranVin
    this._manufactureYear = vehicle.manufactureYear
    this._modelYear = vehicle.modelYear
    this._type = vehicle.type
    this._gasGrade = vehicle.gasGrade

    this._plate = vehicle.plate
    this._personId = vehicle.personId
  }

  get personId (): IVehicle['personId'] {
    return this._personId
  }

  get plate (): IVehicle['plate'] {
    return this._plate
  }

  get object (): IVehicle {
    return {
      _id: this._id,
      tenantId: this.tenantId,
      actions: this.actions,
      active: this.active,
      createdAt: this.createdAt,
      deletionDate: this.deletionDate,
      description: this._description,
      brand: this._brand,
      model: this._model,
      color: this._color,
      chassis: this._chassis,
      factoryVin: this._factoryVin,
      detranVin: this._detranVin,
      manufactureYear: this._manufactureYear,
      modelYear: this._modelYear,
      type: this._type,
      gasGrade: this._gasGrade,
      plate: this._plate,
      personId: this._personId
    }
  }

  get show (): IVehicle {
    return this.object
  }

  static listFilters (
    {
      tenantId,
      search,
      limit,
      page,
      active,
      personId
    }: Partial<IListVehiclesFilters>
  ): IListVehiclesFilters {
    const filters = {
      tenantId,
      deletionDate: undefined
    } as IListVehiclesFilters

    if (personId) Object.assign(filters, { personId: ObjectId(personId) })
    if (tenantId) Object.assign(filters, { tenantId: ObjectId(tenantId) })
    if (active) Object.assign(filters, { active: format.boolean(active) })
    if (search) {
      Object.assign(filters, {
        $or: [
          { description: { $regex: search, $options: 'i' } },
          { brand: { $regex: search, $options: 'i' } },
          { model: { $regex: search, $options: 'i' } },
          { color: { $regex: search, $options: 'i' } },
          { chassis: { $regex: search, $options: 'i' } },
          { factoryVin: { $regex: search, $options: 'i' } },
          { detranVin: { $regex: search, $options: 'i' } },
          { gasGrade: { $regex: search, $options: 'i' } },
          { plate: { $regex: search, $options: 'i' } }
        ]
      })
    }
    if (limit) Object.assign(filters, { limit: Number(limit) })
    if (page) Object.assign(filters, { page: Number(page) })

    return filters
  }
}
