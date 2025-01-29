import mongoose, { AggregatePaginateModel, Document } from 'mongoose'

import Schema, { coreSchema } from '../../core/Schema'
import { ISynchronization } from './SynchronizationModel'

export interface ISynchronizationDocument extends Document, Omit<ISynchronization, '_id'> { }

export interface ISynchronizationMongoDB extends AggregatePaginateModel<ISynchronization> { }

class SynchronizationSchema extends Schema<ISynchronizationDocument> {
  constructor () {
    const synchronization = new mongoose.Schema({
      ...coreSchema,
      finished: {
        type: Boolean,
        default: false
      },
      executedsNumber: {
        type: Number,
        default: 0
      },
      syncErrors: {
        type: Array<String>,
        default: []
      },
      endDate: Date,
      totalDocs: {
        type: Number,
        required: true
      }
    })

    super(synchronization)
  }
}

export default new SynchronizationSchema()
