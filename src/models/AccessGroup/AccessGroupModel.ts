import { Types } from 'mongoose'

import { IDeleteModelProps, IListModelsFilters, IModel, IUpdateModelProps } from '../../core/interfaces/Model'
import Model from '../../core/Model'
import { format } from '../../utils/format'
import ObjectId from '../../utils/ObjectId'

export interface IFindAllAccessGroupsProps {
  tenantId: Types.ObjectId
  select?: Array<string>
}

export interface IFindAccessGroupByNameProps {
  name: string
  tenantId: Types.ObjectId
}

export interface IListAccessGroupsFilters extends IListModelsFilters { }

export interface IUpdateAccessGroupProps extends IUpdateModelProps<IAccessGroup> {}

export interface IDeleteAccessGroupProps extends IDeleteModelProps { }

export interface IUpdateAccessGroupRepositoryProps {
  id: Types.ObjectId
  tenantId: Types.ObjectId
  data: Partial<IAccessGroup>
}

export enum Permission {
  create = 'create',
  read = 'read',
  update = 'update',
  delete = 'delete'
}

export interface IModule {
  name: string
  permissions: Array<Permission>
}

export interface IAccessGroup extends IModel {
  name: string
  home: IModule
  modules: Array<IModule>
}

export class AccessGroupModel extends Model<IAccessGroup> {
  private _name: IAccessGroup['name']
  private _home: IAccessGroup['home']
  private _modules: IAccessGroup['modules']

  constructor (accessGroup: IAccessGroup) {
    super(accessGroup)

    this._name = accessGroup.name
    this._home = accessGroup.home
    this._modules = accessGroup.modules
  }

  get name (): IAccessGroup['name'] {
    return this._name
  }

  get object (): IAccessGroup {
    return {
      _id: this._id,
      tenantId: this.tenantId,
      actions: this.actions,
      active: this.active,
      createdAt: this.createdAt,
      deletionDate: this.deletionDate,
      name: this._name,
      home: this._home,
      modules: this._modules
    }
  }

  get show (): IAccessGroup {
    return this.object
  }

  static listFilters (
    {
      tenantId,
      search,
      limit,
      page,
      active
    }: Partial<IListAccessGroupsFilters>
  ): IListAccessGroupsFilters {
    const filters = {
      tenantId,
      deletionDate: undefined
    } as IListAccessGroupsFilters

    if (tenantId) Object.assign(filters, { tenantId: ObjectId(tenantId) })
    if (active) Object.assign(filters, { active: format.boolean(active) })
    if (search) {
      Object.assign(filters, {
        $or: [
          { name: { $regex: search, $options: 'i' } }
        ]
      })
    }
    if (limit) Object.assign(filters, { limit: Number(limit) })
    if (page) Object.assign(filters, { page: Number(page) })

    return filters
  }
}
