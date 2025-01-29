import { Aggregate, Types } from 'mongoose'

import { IFindModelByIdProps } from '../../core/interfaces/Model'
import { IAggregatePaginate, IUpdateProps } from '../../core/interfaces/Repository'
import { Repository } from '../../core/Repository'
import { IListSynchronizationsFilters, ISynchronization, SynchronizationModel } from './SynchronizationModel'
import { ISynchronizationMongoDB } from './SynchronizationSchema'

export class SynchronizationRepository extends Repository<ISynchronizationMongoDB, SynchronizationModel> {
  async findById ({
    id,
    tenantId
  }: IFindModelByIdProps): Promise<SynchronizationModel | null> {
    const document = await this.mongoDB.findOne({
      _id: id,
      tenantId,
      deletionDate: null
    })
    if (!document) return null

    return new SynchronizationModel(document)
  }

  async create (synchronization: SynchronizationModel): Promise<SynchronizationModel> {
    const document = await this.mongoDB.create(synchronization.object)

    return new SynchronizationModel(document)
  }

  async findAllForToday (): Promise<Array<SynchronizationModel>> {
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

    return documents.map(doc => new SynchronizationModel(doc))
  }

  async update ({
    id,
    data,
    tenantId
  }: IUpdateProps<ISynchronization>): Promise<boolean> {
    const updated = await this.mongoDB.updateOne({
      _id: id,
      tenantId
    }, {
      $set: data
    })

    return !!updated.modifiedCount
  }

  async updateSynErrors (id: Types.ObjectId, syncError: any): Promise<boolean> {
    const updated = await this.mongoDB.updateOne({
      _id: id
    }, {
      $push: {
        syncErrors: syncError
      }
    })

    return !!updated.modifiedCount
  }

  async updateExecutedsNumber (id: Types.ObjectId, number: number): Promise<boolean> {
    const updated = await this.mongoDB.updateOne({
      _id: id
    }, {
      $inc: {
        executedsNumber: number
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

  async list ({ limit, page, ...filters }: IListSynchronizationsFilters): Promise<IAggregatePaginate<ISynchronization>> {
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
