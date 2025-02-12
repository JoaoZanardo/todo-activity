import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

import database from '../../config/database'
import { NoticeRepository } from './NoticeRepository'
import NoticeSchema, { INoticeDocument, INoticeMongoDB } from './NoticeSchema'

const noticeSchema = NoticeSchema.schema

noticeSchema.plugin(mongooseAggregatePaginate)

const NoticeMongoDB = database.model<INoticeDocument, INoticeMongoDB>(
  'Notice',
  noticeSchema
)

export const NoticeRepositoryImp = new NoticeRepository(NoticeMongoDB)

export default NoticeMongoDB
