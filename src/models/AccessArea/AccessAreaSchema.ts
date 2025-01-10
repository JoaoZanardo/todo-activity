import mongoose, { AggregatePaginateModel, Document, Types } from 'mongoose'

import Schema, { coreSchema } from '../../core/Schema'
import { IAccessArea } from './AccessAreaModel'

export interface IAccessAreaDocument extends Document, Omit<IAccessArea, '_id'> { }

export interface IAccessAreaMongoDB extends AggregatePaginateModel<IAccessArea> { }

class AccessAreaSchema extends Schema<IAccessAreaDocument> {
  constructor () {
    const accessArea = new mongoose.Schema({
      ...coreSchema,
      accessPointsIds: Array<Types.ObjectId>,
      description: String,

      name: {
        type: String,
        required: true
      }
    })

    super(accessArea)
  }
}

export default new AccessAreaSchema()
