import mongoose, { AggregatePaginateModel, Document, Types } from 'mongoose'

import Schema, { coreSchema } from '../../core/Schema'
import { IAccessSynchronization } from './AccessSynchronizationModel'

export interface IAccessSynchronizationDocument extends Document, Omit<IAccessSynchronization, '_id'> { }

export interface IAccessSynchronizationMongoDB extends AggregatePaginateModel<IAccessSynchronization> { }

class AccessSynchronizationSchema extends Schema<IAccessSynchronizationDocument> {
  constructor () {
    const accessSynchronization = new mongoose.Schema({
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
      totalDocs: Number,

      personTypesIds: {
        type: Array<Types.ObjectId>,
        required: true
      },
      equipmentId: {
        type: Types.ObjectId,
        required: true
      },
      accessPointId: {
        type: Types.ObjectId,
        required: true
      }
    })

    super(accessSynchronization)
  }
}

export default new AccessSynchronizationSchema()
