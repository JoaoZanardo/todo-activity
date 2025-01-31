import { Aggregate, ClientSession, Types } from 'mongoose'

import { IFindModelByIdProps } from '../../core/interfaces/Model'
import { IAggregatePaginate, IUpdateProps } from '../../core/interfaces/Repository'
import { Repository } from '../../core/Repository'
import { AccessSynchronizationModel, IAccessSynchronization, IListAccessSynchronizationsFilters, IUpdateAccessSynchronizationSyncErrorsProps, IUpdateAccessSynchronizationSyncExecutedNumberProps } from './AccessSynchronizationModel'
import { IAccessSynchronizationMongoDB } from './AccessSynchronizationSchema'

export class AccessSynchronizationRepository extends Repository<IAccessSynchronizationMongoDB, AccessSynchronizationModel> {
  async findById ({
    id,
    tenantId
  }: IFindModelByIdProps): Promise<AccessSynchronizationModel | null> {
    const document = await this.mongoDB.findOne({
      _id: id,
      tenantId,
      deletionDate: null
    })
    if (!document) return null

    return new AccessSynchronizationModel(document)
  }

  async create (accessSynchronization: AccessSynchronizationModel, session: ClientSession): Promise<AccessSynchronizationModel> {
    const document = await this.mongoDB.create([accessSynchronization.object], {
      session
    })

    return new AccessSynchronizationModel(document[0])
  }

  async findAllForToday (): Promise<Array<AccessSynchronizationModel>> {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)

    const documents = await this.mongoDB.find({
      executionDate: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      error: null
    })

    return documents.map(doc => new AccessSynchronizationModel(doc))
  }

  async update ({
    id,
    data,
    tenantId,
    session
  }: IUpdateProps<IAccessSynchronization>): Promise<boolean> {
    const updated = await this.mongoDB.updateOne({
      _id: id,
      tenantId
    }, {
      $set: data
    }, {
      session
    })

    return !!updated.modifiedCount
  }

  async updateSynErrors ({
    id,
    syncError,
    tenantId
  }: IUpdateAccessSynchronizationSyncErrorsProps): Promise<boolean> {
    const updated = await this.mongoDB.updateOne({
      _id: id,
      tenantId
    }, {
      $push: {
        syncErrors: syncError
      }
    })

    return !!updated.modifiedCount
  }

  async updateExecutedNumbers ({
    id,
    number,
    tenantId
  }: IUpdateAccessSynchronizationSyncExecutedNumberProps): Promise<boolean> {
    const updated = await this.mongoDB.updateOne({
      _id: id,
      tenantId
    }, {
      $inc: {
        executedNumbers: number
      }
    })

    return !!updated.modifiedCount
  }

  async delete (id: Types.ObjectId): Promise<boolean> {
    const deleted = await this.mongoDB.deleteOne({
      _id: id
    })

    return !!deleted.deletedCount
  }

  async list ({ limit, page, ...filters }: IListAccessSynchronizationsFilters): Promise<IAggregatePaginate<IAccessSynchronization>> {
    const aggregationStages: Aggregate<Array<any>> = this.mongoDB.aggregate([
      { $match: filters },
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
          from: 'equipments',
          localField: 'equipmentId',
          foreignField: '_id',
          as: 'equipment'
        }
      },
      {
        $lookup: {
          from: 'accesspoints',
          localField: 'accessPointId',
          foreignField: '_id',
          as: 'accessPoint'
        }
      },
      {
        $unwind: '$equipment'
      },
      {
        $unwind: '$accessPoint'
      },
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
