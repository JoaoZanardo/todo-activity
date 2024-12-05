import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

import database from '../../config/database'
import { PersonRepository } from './PersonRepository'
import PersonSchema, { IPersonDocument, IPersonMongoDB } from './PersonSchema'

const personSchema = PersonSchema.schema

personSchema.plugin(mongooseAggregatePaginate)

const PersonMongoDB = database.model<IPersonDocument, IPersonMongoDB>(
  'Person',
  personSchema
)

export const PersonRepositoryImp = new PersonRepository(PersonMongoDB)

export default PersonMongoDB
