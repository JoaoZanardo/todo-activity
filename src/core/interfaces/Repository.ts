import { Types } from 'mongoose'

interface IAggregatePaginate<T> {
  hasPrevPage: boolean
  hasNextPage: boolean
  docs: Array<T>
  limit: number
  totalDocs: number
  totalPages: number
  pagingCounter: number
}

interface IUpdateProps<T = any> {
  id: Types.ObjectId
  tenantId: Types.ObjectId
  data: Partial<T>
}

interface IFindAllProps {
  tenantId: Types.ObjectId
  select?: Array<string>
}

export type {
  IAggregatePaginate,
  IFindAllProps,
  IUpdateProps
}
