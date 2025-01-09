import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

import database from '../../config/database'
import { AreaRepository } from './AreaRepository'
import AreaSchema, { IAreaDocument, IAreaMongoDB } from './AreaSchema'

const areaSchema = AreaSchema.schema

areaSchema.plugin(mongooseAggregatePaginate)

const AreaMongoDB = database.model<IAreaDocument, IAreaMongoDB>(
  'Area',
  areaSchema
)

export const AreaRepositoryImp = new AreaRepository(AreaMongoDB)

export default AreaMongoDB
