import { Aggregate, FilterQuery, Types } from 'mongoose'

import { IFindModelByIdProps, IFindModelByNameProps } from '../../core/interfaces/Model'
import { IAggregatePaginate, IUpdateProps } from '../../core/interfaces/Repository'
import { Repository } from '../../core/Repository'
import { EquipmentModel, IEquipment, IFindEquipmentByIpProps, IListEquipmentsFilters } from './EquipmentModel'
import { IEquipmentMongoDB } from './EquipmentSchema'

export class EquipmentRepository extends Repository<IEquipmentMongoDB, EquipmentModel> {
  async findById ({
    id,
    tenantId
  }: IFindModelByIdProps): Promise<EquipmentModel | null> {
    const document = await this.mongoDB.findOne({
      _id: id,
      tenantId,
      deletionDate: null
    })
    if (!document) return null

    return new EquipmentModel(document)
  }

  async findByIp ({
    ip,
    tenantId
  }: IFindEquipmentByIpProps): Promise<EquipmentModel | null> {
    const match: FilterQuery<IEquipment> = {
      ip,
      tenantId,
      deletionDate: null
    }

    const document = await this.mongoDB.findOne(match).lean()
    if (!document) return null

    return new EquipmentModel(document)
  }

  async findByName ({
    name,
    tenantId
  }: IFindModelByNameProps): Promise<EquipmentModel | null> {
    const match: FilterQuery<IEquipment> = {
      name,
      tenantId,
      deletionDate: null
    }

    const document = await this.mongoDB.findOne(match).lean()
    if (!document) return null

    return new EquipmentModel(document)
  }

  async list ({ limit, page, ...filters }: IListEquipmentsFilters): Promise<IAggregatePaginate<IEquipment>> {
    const aggregationStages: Aggregate<Array<any>> = this.mongoDB.aggregate([
      { $match: filters },
      { $sort: { _id: -1 } }
    ])

    return await this.mongoDB.aggregatePaginate(aggregationStages, { limit, page })
  }

  async findAll (tenantId: Types.ObjectId): Promise<IAggregatePaginate<IEquipment>> {
    const aggregationStages: Aggregate<Array<any>> = this.mongoDB.aggregate([
      {
        $match: {
          tenantId,
          active: true,
          deletionDate: null
        }
      },
      {
        $lookup: {
          from: 'accesspoints',
          localField: '_id',
          foreignField: 'equipmentsIds',
          as: 'associatedAccessPoints'
        }
      },
      {
        $addFields: {
          alreadyAssociated: { $gt: [{ $size: '$associatedAccessPoints' }, 0] }
        }
      },
      {
        $project: {
          associatedAccessPoints: 0
        }
      },
      // {
      //   $project: {
      //     _id: 1,
      //     name: 1,
      //     pattern: 1,
      //     alreadyAssociated: 1,
      //     associatedAccessPoints: 0,
      //     serialNumber: 0,
      //     description: 0,
      //     ip: 0
      //   }
      // },
      { $sort: { _id: -1 } }
    ])

    return await this.mongoDB.aggregatePaginate(aggregationStages, { limit: 1000 })
  }

  async create (equipment: EquipmentModel): Promise<EquipmentModel> {
    const document = await this.mongoDB.create(equipment.object)

    return new EquipmentModel(document)
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
