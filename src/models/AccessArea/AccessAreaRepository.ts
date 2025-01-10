import { Aggregate, FilterQuery } from 'mongoose'

import { IFindModelByIdProps, IFindModelByNameProps } from '../../core/interfaces/Model'
import { IAggregatePaginate, IFindAllProps, IUpdateProps } from '../../core/interfaces/Repository'
import { Repository } from '../../core/Repository'
import { AccessAreaModel, IAccessArea, IListAccessAreasFilters } from './AccessAreaModel'
import { IAccessAreaMongoDB } from './AccessAreaSchema'

export class AccessAreaRepository extends Repository<IAccessAreaMongoDB, AccessAreaModel> {
  async findById ({
    id,
    tenantId
  }: IFindModelByIdProps): Promise<AccessAreaModel | null> {
    const match: FilterQuery<IAccessArea> = {
      _id: id,
      tenantId,
      deletionDate: null
    }

    const document = await this.mongoDB.findOne(match).lean()
    if (!document) return null

    return new AccessAreaModel(document)
  }

  async findByName ({
    name,
    tenantId
  }: IFindModelByNameProps): Promise<AccessAreaModel | null> {
    const match: FilterQuery<IAccessArea> = {
      name,
      tenantId,
      deletionDate: null
    }

    const document = await this.mongoDB.findOne(match).lean()
    if (!document) return null

    return new AccessAreaModel(document)
  }

  async list ({ limit, page, ...filters }: IListAccessAreasFilters): Promise<IAggregatePaginate<IAccessArea>> {
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
  }: IFindAllProps): Promise<Array<Partial<IAccessArea>>> {
    const documents = await this.mongoDB.find({
      tenantId,
      active: true,
      deletionDate: null
    }, select)

    return documents
  }

  async create (accessArea: AccessAreaModel): Promise < AccessAreaModel > {
    const document = await this.mongoDB.create(accessArea.object)

    return new AccessAreaModel(document)
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
