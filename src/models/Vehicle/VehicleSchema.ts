import mongoose, { AggregatePaginateModel, Document, Types } from 'mongoose'

import Schema, { coreSchema } from '../../core/Schema'
import { IVehicle } from './VehicleModel'

export interface IVehicleDocument extends Document, Omit<IVehicle, '_id'> { }

export interface IVehicleMongoDB extends AggregatePaginateModel<IVehicle> { }

class VehicleSchema extends Schema<IVehicleDocument> {
  constructor () {
    const vehicle = new mongoose.Schema({
      ...coreSchema,
      description: String,
      brand: String,
      pattern: String,
      color: String,
      chassis: String,
      factoryVin: String,
      detranVin: String,
      manufactureYear: String,
      modelYear: String,
      vehicleType: String,
      gasGrade: String,

      plate: {
        type: String,
        required: true
      },
      personId: {
        type: Types.ObjectId,
        required: true
      }
    })

    super(vehicle)
  }
}

export default new VehicleSchema()
