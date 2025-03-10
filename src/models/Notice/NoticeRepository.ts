import { Aggregate, PipelineStage } from 'mongoose'

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
    const aggregationStages: Array<PipelineStage> = [
      {
        $match: {
          _id: id,
          tenantId,
          deletionDate: null
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
    ]

    const result = await this.mongoDB.aggregate(aggregationStages)

    if (!result.length) return null

    return new NoticeModel(result[0])
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
