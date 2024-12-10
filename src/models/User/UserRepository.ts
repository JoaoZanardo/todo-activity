import { Aggregate } from 'mongoose'

import { IFindModelByIdProps } from '../../core/interfaces/Model'
import { IAggregatePaginate, IUpdateProps } from '../../core/interfaces/Repository'
import { Repository } from '../../core/Repository'
import { IFindUserByEmailProps, IListUsersFilters, IUser, UserModel } from './UserModel'
import { IUserMongoDB } from './UserSchema'

export class UserRepository extends Repository<IUserMongoDB, UserModel> {
  async findById ({
    id,
    tenantId
  }: IFindModelByIdProps): Promise<UserModel | null> {
    const pipeline = [
      { $match: { _id: id, tenantId, deletionDate: null } },
      {
        $lookup: {
          from: 'accessgroups',
          localField: 'accessGroupId',
          foreignField: '_id',
          as: 'accessGroup'
        }
      },
      {
        $unwind: {
          path: '$accessGroup',
          preserveNullAndEmptyArrays: true
        }
      }
    ]

    const result = await this.mongoDB.aggregate(pipeline).exec()

    if (!result.length) return null

    return new UserModel(result[0])
  }

  async findByEmail ({
    email,
    tenantId
  }: IFindUserByEmailProps): Promise<UserModel | null> {
    const document = await this.mongoDB.findOne({
      email,
      tenantId,
      deletionDate: null
    })
    if (!document) return null

    return new UserModel(document)
  }

  async create (user: UserModel): Promise<UserModel> {
    const document = await this.mongoDB.create(user.object)

    return new UserModel(document)
  }

  async update ({
    id,
    data,
    tenantId
  }: IUpdateProps<IUser>): Promise<boolean> {
    const updated = await this.mongoDB.updateOne({
      _id: id,
      tenantId
    }, {
      $set: data
    })

    return !!updated.modifiedCount
  }

  async list ({ limit, page, ...filters }: IListUsersFilters): Promise<IAggregatePaginate<IUser>> {
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
