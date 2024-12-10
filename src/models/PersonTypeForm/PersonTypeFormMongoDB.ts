import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

import database from '../../config/database'
import { PersonTypeFormRepository } from './PersonTypeFormRepository'
import PersonTypeFormSchema, { IPersonTypeFormDocument, IPersonTypeFormMongoDB } from './PersonTypeFormSchema'

const personTypeFormSchema = PersonTypeFormSchema.schema

personTypeFormSchema.plugin(mongooseAggregatePaginate)

const PersonTypeFormMongoDB = database.model<IPersonTypeFormDocument, IPersonTypeFormMongoDB>(
  'PersonTypeForm',
  personTypeFormSchema
)

export const PersonTypeFormRepositoryImp = new PersonTypeFormRepository(PersonTypeFormMongoDB)

export default PersonTypeFormMongoDB
