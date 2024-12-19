import mongoose, { AggregatePaginateModel, Document, Types } from 'mongoose'

import Schema, { coreSchema } from '../../core/Schema'
import { TimeUnit } from '../PersonType/PersonTypeModel'
import { IPersonTypeCategory } from './PersonTypeCategoryModel'

export interface IPersonTypeCategoryDocument extends Document, Omit<IPersonTypeCategory, '_id'> { }

export interface IPersonTypeCategoryMongoDB extends AggregatePaginateModel<IPersonTypeCategory> { }

class PersonTypeCategorySchema extends Schema<IPersonTypeCategoryDocument> {
  constructor () {
    const personTypeCategory = new mongoose.Schema({
      ...coreSchema,
      description: String,
      appAccess: {
        type: Boolean,
        default: false
      },
      expiringTime: {
        value: String,
        unit: {
          type: String,
          enum: TimeUnit
        }
      },

      name: {
        type: String,
        required: true
      },
      personTypeId: {
        type: Types.ObjectId,
        required: true
      }
    })

    super(personTypeCategory)
  }
}

export default new PersonTypeCategorySchema()
