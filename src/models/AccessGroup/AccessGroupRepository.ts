import { Aggregate, FilterQuery } from 'mongoose'

import { IFindModelByIdProps } from '../../core/interfaces/Model'
import { IAggregatePaginate, IUpdateProps } from '../../core/interfaces/Repository'
import { Repository } from '../../core/Repository'
import { AccessGroupModel, IAccessGroup, IFindAccessGroupByNameProps, IFindAllAccessGroupsProps, IListAccessGroupsFilters } from './AccessGroupModel'
import { IAccessGroupMongoDB } from './AccessGroupSchema'

export class AccessGroupRepository extends Repository<IAccessGroupMongoDB, AccessGroupModel> {
  async findByName ({
    name,
    tenantId
  }: IFindAccessGroupByNameProps): Promise<AccessGroupModel | null> {
    const document = await this.mongoDB.findOne({
      name,
      tenantId,
      deletionDate: null
    })
    if (!document) return null

    return new AccessGroupModel(document)
  }

  async findById ({
    id,
    tenantId
  }: IFindModelByIdProps): Promise<AccessGroupModel | null> {
    const match: FilterQuery<IAccessGroup> = {
      _id: id,
      tenantId,
      deletionDate: null
    }

    const document = await this.mongoDB.findOne(match).lean()
    if (!document) return null

    return new AccessGroupModel(document)
  }

  async list ({ limit, page, ...filters }: IListAccessGroupsFilters): Promise<IAggregatePaginate<IAccessGroup>> {
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
  }: IFindAllAccessGroupsProps): Promise<Array<Partial<IAccessGroup>>> {
    const documents = await this.mongoDB.find({
      tenantId,
      active: true,
      deletionDate: null
    }, select)

    return documents
  }

  async create (accessGroup: AccessGroupModel): Promise < AccessGroupModel > {
    const document = await this.mongoDB.create(accessGroup.object)

    return new AccessGroupModel(document)
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
