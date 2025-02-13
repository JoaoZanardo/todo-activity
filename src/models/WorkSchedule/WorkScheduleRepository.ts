import { Aggregate, FilterQuery } from 'mongoose'

import { IFindAllModelsProps, IFindModelByIdProps, IFindModelByNameProps } from '../../core/interfaces/Model'
import { IAggregatePaginate, IUpdateProps } from '../../core/interfaces/Repository'
import { Repository } from '../../core/Repository'
import { DateUtils } from '../../utils/Date'
import { IListWorkSchedulesFilters, IWorkSchedule, WorkScheduleModel } from './WorkScheduleModel'
import { IWorkScheduleMongoDB } from './WorkScheduleSchema'

export class WorkScheduleRepository extends Repository<IWorkScheduleMongoDB, WorkScheduleModel> {
  async findById ({
    id,
    tenantId

  }: IFindModelByIdProps): Promise<WorkScheduleModel | null> {
    const match: FilterQuery<IWorkSchedule> = {
      _id: id,
      tenantId,
      deletionDate: null
    }

    const document = await this.mongoDB.findOne(match).lean()
    if (!document) return null

    return new WorkScheduleModel(document)
  }

  async findByName ({
    name,
    tenantId
  }: IFindModelByNameProps): Promise<WorkScheduleModel | null> {
    const match: FilterQuery<IWorkSchedule> = {
      name,
      tenantId,
      deletionDate: null
    }

    const document = await this.mongoDB.findOne(match).lean()
    if (!document) return null

    return new WorkScheduleModel(document)
  }

  async findAllInOfSchedule (): Promise<Array<WorkScheduleModel>> {
    const now = DateUtils.getCurrent()
    const currentTime = now.toTimeString().slice(0, 5)
    const currentDay = now.toLocaleString('en-US', { weekday: 'long' })

    const documents = await this.mongoDB.find({
      days: { $in: [currentDay] },
      startTime: { $lt: currentTime },
      endTime: { $gte: currentTime },
      active: false,
      deletionDate: null
    })

    return documents.map(document => new WorkScheduleModel(document))
  }

  async findAllOutOfSchedule (): Promise<Array<WorkScheduleModel>> {
    const now = DateUtils.getCurrent()
    const currentTime = now.toTimeString().slice(0, 5)
    const currentDay = now.toLocaleString('en-US', { weekday: 'long' })

    const documents = await this.mongoDB.find({
      days: { $in: [currentDay] },
      endTime: { $lte: currentTime },
      active: true,
      deletionDate: null
    })

    return documents.map(document => new WorkScheduleModel(document))
  }

  async create (WorkSchedule: WorkScheduleModel): Promise<WorkScheduleModel> {
    const document = await this.mongoDB.create(WorkSchedule.object)

    return new WorkScheduleModel(document)
  }

  async findAll ({
    tenantId
  }: IFindAllModelsProps): Promise<Array<Partial<IWorkSchedule>>> {
    return await this.mongoDB.find({
      tenantId,
      active: true,
      deletionDate: null
    })
  }

  async update ({
    id,
    data,
    tenantId
  }: IUpdateProps<IWorkSchedule>): Promise<boolean> {
    const updated = await this.mongoDB.updateOne({
      _id: id,
      tenantId
    }, {
      $set: data
    })

    return !!updated.modifiedCount
  }

  async list ({ limit, page, ...filters }: IListWorkSchedulesFilters): Promise<IAggregatePaginate<IWorkSchedule>> {
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
