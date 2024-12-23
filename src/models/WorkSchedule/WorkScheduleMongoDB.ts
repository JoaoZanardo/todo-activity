import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

import database from '../../config/database'
import { WorkScheduleRepository } from './WorkScheduleRepository'
import WorkScheduleSchema, { IWorkScheduleDocument, IWorkScheduleMongoDB } from './WorkScheduleSchema'

const workScheduleSchema = WorkScheduleSchema.schema

workScheduleSchema.plugin(mongooseAggregatePaginate)

const WorkScheduleMongoDB = database.model<IWorkScheduleDocument, IWorkScheduleMongoDB>(
  'WorkSchedule',
  workScheduleSchema
)

export const WorkScheduleRepositoryImp = new WorkScheduleRepository(WorkScheduleMongoDB)

export default WorkScheduleMongoDB
