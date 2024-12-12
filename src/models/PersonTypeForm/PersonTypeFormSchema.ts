import mongoose, { AggregatePaginateModel, Document, Types } from 'mongoose'

import Schema, { coreSchema } from '../../core/Schema'
import { InputType, IPersonTypeForm } from './PersonTypeFormModel'

export interface IPersonTypeFormDocument extends Document, Omit<IPersonTypeForm, '_id'> { }

export interface IPersonTypeFormMongoDB extends AggregatePaginateModel<IPersonTypeForm> { }

class PersonTypeFormSchema extends Schema<IPersonTypeFormDocument> {
  constructor () {
    const personTypeForm = new mongoose.Schema({
      ...coreSchema,
      personTypeId: {
        type: Types.ObjectId,
        required: true
      },
      fields: {
        type: [
          new mongoose.Schema({
            key: String,
            type: {
              type: String,
              enum: InputType
            },
            options: Array
          })
        ],
        required: true
      }
    })

    super(personTypeForm)
  }
}

export default new PersonTypeFormSchema()
