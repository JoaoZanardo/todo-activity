import { Types } from 'mongoose'

interface IListModelsFilters {
  deletionDate?: Date
  search?: string
  active?: string
  limit?: number
  page?: number
  tenantId: Types.ObjectId
}

interface IFindModelByIdProps {
  id: Types.ObjectId
  tenantId: Types.ObjectId
}

interface IUpdateModelProps<T> {
  responsibleId?: Types.ObjectId

  id: Types.ObjectId
  tenantId: Types.ObjectId
  data: Partial<T>
}

interface IDeleteModelProps {
  id: Types.ObjectId
  tenantId: Types.ObjectId
  responsibleId: Types.ObjectId
}

interface IFindModelByNameProps {
  name: string
  tenantId: Types.ObjectId
}

export enum ModelAction {
  create = 'create',
  delete = 'delete',
  update = 'update',
}

interface IModelAction {
  userId?: Types.ObjectId

  action: ModelAction
  date: Date
}

interface IModel {
  _id?: Types.ObjectId
  tenantId: Types.ObjectId
  active?: boolean
  createdAt?: Date
  actions?: Array<IModelAction>
  deletionDate?: Date
}

export type {
  IDeleteModelProps,
  IFindModelByIdProps,
  IFindModelByNameProps,
  IListModelsFilters,
  IModel,
  IModelAction,
  IUpdateModelProps
}
