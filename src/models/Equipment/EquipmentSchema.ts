import mongoose, { AggregatePaginateModel, Document } from 'mongoose'

import Schema, { coreSchema } from '../../core/Schema'
import { IEquipment } from '../Equipment/EquipmentModel'

export interface IEquipmentDocument extends Document, Omit<IEquipment, '_id'> { }

export interface IEquipmentMongoDB extends AggregatePaginateModel<IEquipment> { }

class EquipmentSchema extends Schema<IEquipmentDocument> {
  constructor () {
    const Equipment = new mongoose.Schema({
      ...coreSchema,
      serialNumber: String,

      type: {
        type: String,
        required: true
      },
      brand: {
        type: String,
        required: true
      },
      pattern: {
        type: String,
        required: true
      },
      ip: {
        type: String,
        required: true
      }
    })

    super(Equipment)
  }
}

export default new EquipmentSchema()
