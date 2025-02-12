import mongoose, { AggregatePaginateModel, Document, Types } from 'mongoose'

import Schema, { coreSchema } from '../../core/Schema'
import { INotice } from './NoticeModel'

export interface INoticeDocument extends Document, Omit<INotice, '_id'> { }

export interface INoticeMongoDB extends AggregatePaginateModel<INotice> { }

class NoticeSchema extends Schema<INoticeDocument> {
  constructor () {
    const Notice = new mongoose.Schema({
      ...coreSchema,
      observation: String,
      initDate: Date,
      endDate: Date,
      discharged: Boolean,

      title: {
        type: String,
        required: true
      },
      type: {
        type: String,
        required: true
      },
      personId: {
        type: Types.ObjectId,
        required: true
      }
    })

    super(Notice)
  }
}

export default new NoticeSchema()
