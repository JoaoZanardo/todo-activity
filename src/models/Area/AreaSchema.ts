import mongoose, { AggregatePaginateModel, Document } from 'mongoose'

import Schema, { coreSchema } from '../../core/Schema'
import { IArea } from './AreaModel'

export interface IAreaDocument extends Document, Omit<IArea, '_id'> { }

export interface IAreaMongoDB extends AggregatePaginateModel<IArea> { }

class AreaSchema extends Schema<IAreaDocument> {
  constructor () {
    const area = new mongoose.Schema({
      ...coreSchema,
      serialNumber: String,

      pattern: {
        type: Object,
        required: true
      },
      name: {
        type: String,
        required: true
      },
      ip: {
        type: String,
        required: true
      },
      description: String
    })

    super(area)
  }
}

export default new AreaSchema()
