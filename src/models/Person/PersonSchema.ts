import mongoose, { AggregatePaginateModel, Document, Types } from 'mongoose'

import Schema, { coreSchema } from '../../core/Schema'
import { IPerson, PersonCreationType } from './PersonModel'

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
      phone: String,
      address: {
        streetName: String,
        streetNumber: Number
      },
      cnh: Object,
      responsibleId: String,
      cnpj: String,
      register: String,
      role: String,
      rg: String,
      passport: String,
      cpf: String,
      picture: String,
      personTypeCategoryId: Types.ObjectId,
      bondAreasIds: Array<Types.ObjectId>,
      userId: Types.ObjectId,
      creationType: {
        type: String,
        enum: PersonCreationType,
        default: PersonCreationType.default
      },
      appAccess: {
        type: Boolean,
        default: false
      },
      landline: String,

      code: {
        type: String,
        requied: true
      },
      personTypeId: {
        type: Types.ObjectId,
        required: true
      },
      name: {
        type: String,
        required: true
      }
    })

    super(person)
  }
}

export default new PersonSchema()
