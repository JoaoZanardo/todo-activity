import { Aggregate, FilterQuery, Types } from 'mongoose'

import { IFindModelByIdProps } from '../../core/interfaces/Model'
import { IAggregatePaginate, IUpdateProps } from '../../core/interfaces/Repository'
import { Repository } from '../../core/Repository'
import { AccessPointModel, IAccessPoint, IFindAccessPointByEquipmentIdProps, IFindAccessPointByNameProps, IFindAllAccessPointsByAreaIdProps, IFindAllAccessPointsByPersonTypeIdProps, IListAccessPointsFilters } from './AccessPointModel'
import { IAccessPointMongoDB } from './AccessPointSchema'

export class AccessPointRepository extends Repository<IAccessPointMongoDB, AccessPointModel> {
  async findById ({
    id,
    tenantId
  }: IFindModelByIdProps): Promise<AccessPointModel | null> {
    const match: FilterQuery<IAccessPoint> = {
      _id: id,
      tenantId,
      deletionDate: null
    }

    const document = await this.mongoDB.findOne(match).lean()
    if (!document) return null

    return new AccessPointModel(document)
  }

  async findByEquipmentId ({
    equipmentId,
    tenantId
  }: IFindAccessPointByEquipmentIdProps): Promise<AccessPointModel | null> {
    const document = await this.mongoDB.findOne({
      equipmentsIds: {
        $in: [equipmentId]
      },
      tenantId,
      deletionDate: null
    })
    if (!document) return null

    return new AccessPointModel(document)
  }

  async findAllByPersonTypeId ({
    personTypeId,
    tenantId
  }: IFindAllAccessPointsByPersonTypeIdProps): Promise<Array<Partial<IAccessPoint>>> {
    const documents = await this.mongoDB.find({
      personTypesIds: {
        $in: [personTypeId]
      },
      tenantId,
      deletionDate: null
    }, ['_id', 'generalExit', 'equipmentsIds', 'personTypesIds'])

    return documents
  }

  async findAllByAreaId ({
    areaId,
    tenantId
  }: IFindAllAccessPointsByAreaIdProps): Promise<Array<Partial<IAccessPoint>>> {
    const documents = await this.mongoDB.find({
      areaId,
      tenantId,
      deletionDate: null
    }, ['_id', 'generalExit', 'equipmentsIds', 'personTypesIds'])

    return documents
  }

  async findByName ({
    name,
    tenantId,
    accessAreaId,
    areaId
  }: IFindAccessPointByNameProps): Promise<AccessPointModel | null> {
    const match: FilterQuery<IAccessPoint> = {
      accessAreaId,
      areaId,
      name,
      tenantId,
      deletionDate: null
    }

    const document = await this.mongoDB.findOne(match).lean()
    if (!document) return null

    return new AccessPointModel(document)
  }

  async list ({ limit, page, ...filters }: IListAccessPointsFilters): Promise<IAggregatePaginate<IAccessPoint>> {
    const aggregationStages: Aggregate<Array<any>> = this.mongoDB.aggregate([
      {
        $match: filters
      },
      {
        $lookup: {
          from: 'persontypes',
          let: { personTypesIds: '$personTypesIds' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ['$_id', '$$personTypesIds']
                }
              }
            }
          ],
          as: 'personTypes'
        }
      },
      {
        $lookup: {
          from: 'equipment',
          let: { equipmentsIds: '$equipmentsIds' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ['$_id', '$$equipmentsIds']
                }
              }
            }
          ],
          as: 'equipments'
        }
      },
      { $sort: { _id: -1 } }
    ])

    return await this.mongoDB.aggregatePaginate(aggregationStages, {
      limit,
      page
    })
  }

  async findAll (tenantId: Types.ObjectId): Promise<IAggregatePaginate<IAccessPoint>> {
    const aggregationStages: Aggregate<Array<any>> = this.mongoDB.aggregate([
      {
        $match: {
          tenantId
        }
      },
      {
        $lookup: {
          from: 'persontypes',
          let: { personTypesIds: '$personTypesIds' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ['$_id', '$$personTypesIds']
                }
              }
            }
          ],
          as: 'personTypes'
        }
      },
      {
        $lookup: {
          from: 'equipment',
          let: { equipmentsIds: '$equipmentsIds' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ['$_id', '$$equipmentsIds']
                }
              }
            }
          ],
          as: 'equipments'
        }
      },
      {
        $lookup: {
          from: 'areas',
          localField: 'areaId',
          foreignField: '_id',
          as: 'area'
        }
      },
      {
        $lookup: {
          from: 'accessareas',
          localField: 'accessAreaId',
          foreignField: '_id',
          as: 'accessArea'
        }
      },
      {
        $unwind: {
          path: '$area',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: '$accessArea',
          preserveNullAndEmptyArrays: true
        }
      },
      { $sort: { _id: -1 } },
      {
        $project: {
          _id: 1,
          name: 1,
          accessType: 1,
          area: 1,
          accessArea: 1,
          personTypes: 1,
          equipments: 1
        }
      }
    ])

    return await this.mongoDB.aggregatePaginate(aggregationStages, { limit: 1000 })
  }

  async create (AccessPoint: AccessPointModel): Promise < AccessPointModel > {
    const document = await this.mongoDB.create(AccessPoint.object)

    return new AccessPointModel(document)
  }

  async update ({
    id,
    tenantId,
    data
  }: IUpdateProps): Promise < boolean > {
    const updated = await this.mongoDB.updateOne({
      _id: id,
      tenantId
    }, {
      $set: data
    })

    return !!updated.modifiedCount
  }
}
