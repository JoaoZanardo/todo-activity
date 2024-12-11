import mongoose, { Document, Model } from 'mongoose'

import Schema from '../../core/Schema'
import { ITenant } from './TenantModel'

export interface ITenantDocument extends Document, Omit<ITenant, '_id'> { }

export interface ITenantMongoDB extends Model<ITenant> { }

class TenantSchema extends Schema<ITenantDocument> {
  constructor () {
    const tenant = new mongoose.Schema({
      actions: Array,
      active: {
        type: Boolean,
        default: true
      },
      createdAt: Date,
      deletionDate: Date,
      image: String,
      color: String,
      modules: Array,
      usersNumber: Number,
      peopleNumber: Number,
      freeTrial: {
        type: Boolean,
        default: true
      },
      name: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true
      }
    })

    super(tenant)
  }
}

export default new TenantSchema()
