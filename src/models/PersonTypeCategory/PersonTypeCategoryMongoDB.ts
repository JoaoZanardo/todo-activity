import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

import database from '../../config/database'
import { PersonTypeCategoryRepository } from './PersonTypeCategoryRepository'
import PersonTypeCategorySchema, { IPersonTypeCategoryDocument, IPersonTypeCategoryMongoDB } from './PersonTypeCategorySchema'

const personTypeSchema = PersonTypeCategorySchema.schema

personTypeSchema.plugin(mongooseAggregatePaginate)

const PersonTypeCategoryMongoDB = database.model<IPersonTypeCategoryDocument, IPersonTypeCategoryMongoDB>(
  'PersonTypeCategory',
  personTypeSchema
)

export const PersonTypeCategoryRepositoryImp = new PersonTypeCategoryRepository(PersonTypeCategoryMongoDB)

export default PersonTypeCategoryMongoDB
