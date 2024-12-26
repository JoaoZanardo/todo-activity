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
    console.log({ filters })
    const aggregationStages: Aggregate<Array<any>> = this.mongoDB.aggregate([
      { $match: filters },
      {
        $lookup: {
          from: 'persontypes',
          localField: 'personTypeId',
          foreignField: '_id',
          as: 'personType'
        }
      },
      {
        $lookup: {
          from: 'people',
          localField: 'personId',
          foreignField: '_id',
          as: 'person'
        }
      },
      // {
      //   $lookup: {
      //     from: 'persontypecategories',
      //     localField: 'personTypeCategoryId',
      //     foreignField: '_id',
      //     as: 'personTypeCategory'
      //   }
      // },
      // {
      //   $unwind: {
      //     path: '$personTypeCategory',
      //     preserveNullAndEmptyArrays: true
      //   }
      // },
      {
        $unwind: '$personType'
      },
      { $unwind: '$person' },
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
