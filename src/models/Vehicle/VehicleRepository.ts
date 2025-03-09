import { Aggregate } from 'mongoose'

import { IFindModelByIdProps } from '../../core/interfaces/Model'
import { IAggregatePaginate, IUpdateProps } from '../../core/interfaces/Repository'
import { Repository } from '../../core/Repository'
import { IFIndVehicleByPlateProps, IListVehiclesFilters, IVehicle, VehicleModel } from './VehicleModel'
import { IVehicleMongoDB } from './VehicleSchema'

export class VehicleRepository extends Repository<IVehicleMongoDB, VehicleModel> {
  async findById ({
    id,
    tenantId
  }: IFindModelByIdProps): Promise<VehicleModel | null> {
    const document = await this.mongoDB.findOne({
      _id: id,
      tenantId,
      deletionDate: null
    })
    if (!document) return null

    return new VehicleModel(document)
  }

  async findByPlate ({
    plate,
    tenantId
  }: IFIndVehicleByPlateProps): Promise<VehicleModel | null> {
    const document = await this.mongoDB.findOne({
      plate,
      tenantId,
      deletionDate: null
    })
    if (!document) return null

    return new VehicleModel(document)
  }

  async list ({ limit, page, ...filters }: IListVehiclesFilters): Promise<IAggregatePaginate<IVehicle>> {
    const aggregationStages: Aggregate<Array<any>> = this.mongoDB.aggregate([
      { $match: filters },
      { $sort: { _id: -1 } }
    ])

    return await this.mongoDB.aggregatePaginate(aggregationStages, { limit, page })
  }

  async create (vehicle: VehicleModel): Promise<VehicleModel> {
    const document = await this.mongoDB.create(vehicle.object)

    return new VehicleModel(document)
  }

  async update ({
    id,
    tenantId,
    data
  }: IUpdateProps): Promise<boolean> {
    const updated = await this.mongoDB.updateOne({
      _id: id,
      tenantId
    }, {
      $set: data
    })

    return !!updated.modifiedCount
  }
}
