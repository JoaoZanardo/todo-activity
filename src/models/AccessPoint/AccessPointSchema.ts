import mongoose, { AggregatePaginateModel, Document, Types } from 'mongoose'

import Schema, { coreSchema } from '../../core/Schema'
import { IAccessPoint } from './AccessPointModel'

export interface IAccessPointDocument extends Document, Omit<IAccessPoint, '_id'> { }

export interface IAccessPointMongoDB extends AggregatePaginateModel<IAccessPoint> { }

class AccessPointSchema extends Schema<IAccessPointDocument> {
  constructor () {
    const accessPoint = new mongoose.Schema({
      ...coreSchema,
      generalExit: {
        type: Boolean,
        default: false
      },

      accesstype: {
        type: String,
        required: true
      },
      equipmentsIds: {
        type: Types.ObjectId,
        required: true
      },
      personTypesIds: {
        type: Types.ObjectId,
        required: true
      }
    })

    super(accessPoint)
  }
}

export default new AccessPointSchema()
