import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

import database from '../../config/database'
import { VehicleRepository } from './VehicleRepository'
import VehicleSchema, { IVehicleDocument, IVehicleMongoDB } from './VehicleSchema'

const vehicleSchema = VehicleSchema.schema

vehicleSchema.plugin(mongooseAggregatePaginate)

const VehicleMongoDB = database.model<IVehicleDocument, IVehicleMongoDB>(
  'Vehicle',
  vehicleSchema
)

export const VehicleRepositoryImp = new VehicleRepository(VehicleMongoDB)

export default VehicleMongoDB
