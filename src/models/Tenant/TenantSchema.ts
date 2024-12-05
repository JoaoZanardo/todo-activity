import mongoose, { Document, Model } from 'mongoose'

import Schema from '../../core/Schema'
import { ITenant } from './TenantModel'

export interface ITenantDocument extends Document, Omit<ITenant, '_id'> { }

export interface ITenantMongoDB extends Model<ITenant> { }

class TenantSchema extends Schema<ITenantDocument> {
  constructor () {
    const tenant = new mongoose.Schema({
      image: String,
      color: String,
      name: {
        type: String,
        required: true
      },
      modules: {
        type: String,
        required: true
      },
      usersNumber: Number,
      freeTrial: Boolean,
      createdAt: Date
    })

    super(tenant)
  }
}

export default new TenantSchema()
