import { Aggregate, FilterQuery, Types } from 'mongoose'

import { IFindModelByIdProps } from '../../core/interfaces/Model'
import { IAggregatePaginate, IFindAllProps, IUpdateProps } from '../../core/interfaces/Repository'
import { Repository } from '../../core/Repository'
import { AreaModel, IArea, IFindAreaByNameProps, IListAreasFilters } from './AreaModel'
import { IAreaMongoDB } from './AreaSchema'

export class AreaRepository extends Repository<IAreaMongoDB, AreaModel> {
  async findById ({
    id,
    tenantId
  }: IFindModelByIdProps): Promise<AreaModel | null> {
    const match: FilterQuery<IArea> = {
      _id: id,
      tenantId,
      deletionDate: null
    }

    const document = await this.mongoDB.findOne(match).lean()
    if (!document) return null

    return new AreaModel(document)
  }

  async findMain (tenantId: Types.ObjectId): Promise<AreaModel | null> {
    const match: FilterQuery<IArea> = {
      main: true,
      tenantId,
      deletionDate: null
    }

    const document = await this.mongoDB.findOne(match).lean()
    if (!document) return null

    return new AreaModel(document)
  }

  async findByName ({
    name,
    areaId,
    tenantId
  }: IFindAreaByNameProps): Promise<AreaModel | null> {
    const match: FilterQuery<IArea> = {
      name,
      areaId,
      tenantId,
      deletionDate: null
    }

    const document = await this.mongoDB.findOne(match).lean()
    if (!document) return null

    return new AreaModel(document)
  }

  async list ({ limit, page, ...filters }: IListAreasFilters): Promise<IAggregatePaginate<IArea>> {
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
  }: IFindAllProps): Promise<Array<Partial<IArea>>> {
    const documents = await this.mongoDB.find({
      tenantId,
      active: true,
      deletionDate: null
    }, select)

    return documents
  }

  async create (area: AreaModel): Promise < AreaModel > {
    const document = await this.mongoDB.create(area.object)

    return new AreaModel(document)
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
