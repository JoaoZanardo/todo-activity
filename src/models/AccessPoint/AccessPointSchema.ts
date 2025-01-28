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
      accessAreaId: Types.ObjectId,
      areaId: Types.ObjectId,
      manualAccess: {
        type: Boolean,
        default: false
      },

      name: {
        type: String,
        required: true
      },
      accessType: {
        type: String,
        required: true
      },
      equipmentsIds: {
        type: Array<Types.ObjectId>,
        required: true
      },
      personTypesIds: {
        type: Array<Types.ObjectId>,
        required: true
      }
    })

    super(accessPoint)
  }
}

export default new AccessPointSchema()
