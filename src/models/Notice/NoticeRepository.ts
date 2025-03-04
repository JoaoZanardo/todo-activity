import { Aggregate, FilterQuery } from 'mongoose'

import { IFindModelByIdProps } from '../../core/interfaces/Model'
import { IAggregatePaginate, IUpdateProps } from '../../core/interfaces/Repository'
import { Repository } from '../../core/Repository'
import { IListNoticesFilters, INotice, NoticeModel } from './NoticeModel'
import { INoticeMongoDB } from './NoticeSchema'

export class NoticeRepository extends Repository<INoticeMongoDB, NoticeModel> {
  async findById ({
    id,
    tenantId
  }: IFindModelByIdProps): Promise<NoticeModel | null> {
    const match: FilterQuery<INotice> = {
      _id: id,
      tenantId,
      deletionDate: null
    }

    const document = await this.mongoDB.findOne(match).lean()
    if (!document) return null

    return new NoticeModel(document)
  }

  async list ({ limit, page, ...filters }: IListNoticesFilters): Promise<IAggregatePaginate<INotice>> {
    const aggregationStages: Aggregate<Array<any>> = this.mongoDB.aggregate([
      {
        $match: {
          ...filters
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
      {
        $unwind: '$person'
      },
      { $sort: { _id: -1 } }
    ])

    return await this.mongoDB.aggregatePaginate(aggregationStages, {
      limit,
      page
    })
  }

  async create (notice: NoticeModel): Promise < NoticeModel > {
    const document = await this.mongoDB.create(notice.object)

    return new NoticeModel(document)
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
