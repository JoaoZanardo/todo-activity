import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

import database from '../../config/database'
import { EquipmentRepository } from './EquipmentRepository'
import EquipmentSchema, { IEquipmentDocument, IEquipmentMongoDB } from './EquipmentSchema'

const equipmentSchema = EquipmentSchema.schema

equipmentSchema.plugin(mongooseAggregatePaginate)

const EquipmentMongoDB = database.model<IEquipmentDocument, IEquipmentMongoDB>(
  'Equipment',
  equipmentSchema
)

export const EquipmentRepositoryImp = new EquipmentRepository(EquipmentMongoDB)

export default EquipmentMongoDB
