import mongoose, { AggregatePaginateModel, Document } from 'mongoose'

import Schema, { coreSchema } from '../../core/Schema'
import { IEquipment } from '../Equipment/EquipmentModel'

export interface IEquipmentDocument extends Document, Omit<IEquipment, '_id'> { }

export interface IEquipmentMongoDB extends AggregatePaginateModel<IEquipment> { }

class EquipmentSchema extends Schema<IEquipmentDocument> {
  constructor () {
    const equipment = new mongoose.Schema({
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

    super(equipment)
  }
}

export default new EquipmentSchema()
