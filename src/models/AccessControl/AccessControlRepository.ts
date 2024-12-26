import { Aggregate, FilterQuery } from 'mongoose'

import { IFindModelByIdProps } from '../../core/interfaces/Model'
import { IAggregatePaginate, IUpdateProps } from '../../core/interfaces/Repository'
import { Repository } from '../../core/Repository'
import { AccessControlModel, IAccessControl, IListAccessControlsFilters } from './AccessControlModel'
import { IAccessControlMongoDB } from './AccessControlSchema'

export class AccessControlRepository extends Repository<IAccessControlMongoDB, AccessControlModel> {
  async findById ({
    id,
    tenantId
  }: IFindModelByIdProps): Promise<AccessControlModel | null> {
    const match: FilterQuery<IAccessControl> = {
      _id: id,
      tenantId,
      deletionDate: null
    }

    const document = await this.mongoDB.findOne(match).lean()
    if (!document) return null

    return new AccessControlModel(document)
  }

  async create (AccessControl: AccessControlModel): Promise<AccessControlModel> {
    const document = await this.mongoDB.create(AccessControl.object)

    return new AccessControlModel(document)
  }

  async update ({
    id,
    data,
    tenantId
  }: IUpdateProps<IAccessControl>): Promise<boolean> {
    const updated = await this.mongoDB.updateOne({
      _id: id,
      tenantId
    }, {
      $set: data
    })

    return !!updated.modifiedCount
  }

  async list ({ limit, page, ...filters }: IListAccessControlsFilters): Promise<IAggregatePaginate<IAccessControl>> {
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
}
