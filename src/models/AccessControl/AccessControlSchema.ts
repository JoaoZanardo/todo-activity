import mongoose, { AggregatePaginateModel, Document, Types } from 'mongoose'

import Schema, { coreSchema } from '../../core/Schema'
import { AccessControlType, IAccessControl } from './AccessControlModel'

export interface IAccessControlDocument extends Document, Omit<IAccessControl, '_id'> { }

export interface IAccessControlMongoDB extends AggregatePaginateModel<IAccessControl> { }

class AccessControlSchema extends Schema<IAccessControlDocument> {
  constructor () {
    const accessControl = new mongoose.Schema({
      ...coreSchema,
      responsible: {
        id: Types.ObjectId,
        name: String
      },
      observation: String,
      equipment: {
        id: Types.ObjectId,
        name: String,
        ip: String
      },

      type: {
        type: String,
        enum: AccessControlType
      },
      person: {
        id: Types.ObjectId,
        name: {
          type: String,
          required: true
        },
        picture: {
          type: String
        },
        personType: {
          id: Types.ObjectId,
          name: {
            type: String,
            required: true
          }
        },
        personTypeCategory: {
          id: Types.ObjectId,
          name: String
        }
      },
      accessPoint: {
        id: Types.ObjectId,
        name: {
          type: String,
          required: true
        },
        area: {
          id: Types.ObjectId,
          name: String
        },
        accessArea: {
          id: Types.ObjectId,
          name: String
        }
      },
      accessReleaseId: {
        type: Types.ObjectId,
        required: true
      }
    })

    super(accessControl)
  }
}

export default new AccessControlSchema()
