import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

import database from '../../config/database'
import { PersonTypeRepository } from './PersonTypeRepository'
import PersonTypeSchema, { IPersonTypeDocument, IPersonTypeMongoDB } from './PersonTypeSchema'

const personTypeSchema = PersonTypeSchema.schema

personTypeSchema.plugin(mongooseAggregatePaginate)

const PersonTypeMongoDB = database.model<IPersonTypeDocument, IPersonTypeMongoDB>(
  'PersonType',
  personTypeSchema
)

export const PersonTypeRepositoryImp = new PersonTypeRepository(PersonTypeMongoDB)

export default PersonTypeMongoDB
