import mongoose, { AggregatePaginateModel, Document } from 'mongoose'

import Schema, { coreSchema } from '../../core/Schema'
import { IPerson, PersonType } from './PersonModel'

export interface IPersonDocument extends Document, Omit<IPerson, '_id'> { }

export interface IPersonMongoDB extends AggregatePaginateModel<IPerson> { }

class PersonSchema extends Schema<IPersonDocument> {
  constructor () {
    const person = new mongoose.Schema({
      ...coreSchema,
      email: String,
      observation: String,
      contractInitDate: Date,
      contractEndDate: Date,

      name: {
        type: String,
        required: true
      },
      document: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: PersonType,
        required: true
      },
      phone: {
        type: String,
        required: true
      },
      address: {
        streetName: String,
        streetNumber: Number
      }
    })

    super(person)
  }
}

export default new PersonSchema()
