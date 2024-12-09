import mongoose, { AggregatePaginateModel, Document } from 'mongoose'

import Schema, { coreSchema } from '../../core/Schema'
import { IAccessGroup } from './AccessGroupModel'

export interface IAccessGroupDocument extends Document, Omit<IAccessGroup, '_id'> { }

export interface IAccessGroupMongoDB extends AggregatePaginateModel<IAccessGroup> { }

class AccessGroupSchema extends Schema<IAccessGroupDocument> {
  constructor () {
    const accessGroup = new mongoose.Schema({
      ...coreSchema,
      modules: Array,
      name: {
        type: String,
        required: true
      },
      home: {
        type: Object,
        required: true
      }
    })

    super(accessGroup)
  }
}

export default new AccessGroupSchema()
