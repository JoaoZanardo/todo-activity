import mongoose, { AggregatePaginateModel, Document } from 'mongoose'

import Schema, { coreSchema } from '../../core/Schema'
import { IWorkSchedule } from './WorkScheduleModel'

export interface IWorkScheduleDocument extends Document, Omit<IWorkSchedule, '_id'> { }

export interface IWorkScheduleMongoDB extends AggregatePaginateModel<IWorkSchedule> { }

class WorkScheduleSchema extends Schema<IWorkScheduleDocument> {
  constructor () {
    const WorkSchedule = new mongoose.Schema({
      ...coreSchema,
      description: String,

      name: {
        type: String,
        required: true
      },
      days: {
        type: String,
        required: true
      },
      startTime: {
        type: String,
        required: true
      },
      endTime: {
        type: String,
        required: true
      }
    })

    super(WorkSchedule)
  }
}

export default new WorkScheduleSchema()
