import { Aggregate, FilterQuery } from 'mongoose'

import { IFindModelByIdProps } from '../../core/interfaces/Model'
import { IAggregatePaginate, IFindAllProps, IUpdateProps } from '../../core/interfaces/Repository'
import { Repository } from '../../core/Repository'
import { AccessPointModel, IAccessPoint, IFindAccessPointByNameProps, IListAccessPointsFilters } from './AccessPointModel'
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
      { $match: filters },
      { $sort: { _id: -1 } }
    ])

    return await this.mongoDB.aggregatePaginate(
      aggregationStages,
      {
        limit,
        page
      })
  }

  async findAll ({
    tenantId,
    select
  }: IFindAllProps): Promise<Array<Partial<IAccessPoint>>> {
    const documents = await this.mongoDB.find({
      tenantId,
      active: true,
      deletionDate: null
    }, select)

    return documents
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
