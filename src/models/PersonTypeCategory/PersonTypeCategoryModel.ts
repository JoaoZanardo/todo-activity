import { Types } from 'mongoose'

import { IDeleteModelProps, IListModelsFilters, IModel, IUpdateModelProps, ModelAction } from '../../core/interfaces/Model'
import { IFindAllProps } from '../../core/interfaces/Repository'
import Model from '../../core/Model'
import { ExpiringTime } from '../../models/PersonType/PersonTypeModel'
import { DateUtils } from '../../utils/Date'
import ObjectId from '../../utils/ObjectId'

export interface IListPersonTypeCategorysFilters extends IListModelsFilters {
  personTypeId?: Types.ObjectId
}

export interface IUpdatePersonTypeCategoryProps extends IUpdateModelProps<IPersonTypeCategory> {}

export interface IDeletePersonTypeCategoryProps extends IDeleteModelProps {}

export interface IFindAllCategoriesByPersonTypeIdProps extends IFindAllProps {
  personTypeId: Types.ObjectId
}

export interface IPersonTypeCategory extends IModel {
  description?: string
  appAccess?: boolean
  expiringTime?: ExpiringTime

  name: string
  personTypeId: Types.ObjectId
}

export class PersonTypeCategoryModel extends Model<IPersonTypeCategory> {
  private _description?: IPersonTypeCategory['description']
  private _appAccess?: IPersonTypeCategory['appAccess']
  private _expiringTime?: IPersonTypeCategory['expiringTime']

  private _name: IPersonTypeCategory['name']
  private _personTypeId: IPersonTypeCategory['personTypeId']

  constructor (personTypeCategory: IPersonTypeCategory) {
    super(personTypeCategory)

    this._description = personTypeCategory.description
    this._appAccess = personTypeCategory.appAccess
    this._expiringTime = personTypeCategory.expiringTime

    this._name = personTypeCategory.name
    this._personTypeId = personTypeCategory.personTypeId
    this.actions = personTypeCategory.actions || [{
      action: ModelAction.create,
      date: DateUtils.getCurrent()
    }]
  }

  get object (): IPersonTypeCategory {
    return {
      _id: this._id,
      tenantId: this.tenantId,
      actions: this.actions,
      active: this.active,
      createdAt: this.createdAt,
      deletionDate: this.deletionDate,
      description: this._description,
      name: this._name,
      personTypeId: this._personTypeId,
      appAccess: this._appAccess,
      expiringTime: this._expiringTime
    }
  }

  get show () {
    return this.object
  }

  get name (): IPersonTypeCategory['name'] {
    return this._name
  }

  static listFilters (
    {
      search,
      limit,
      page,
      tenantId,
      personTypeId
    }: Partial<IListPersonTypeCategorysFilters>
  ): IListPersonTypeCategorysFilters {
    const filters = {
      deletionDate: undefined
    } as IListPersonTypeCategorysFilters

    if (personTypeId) Object.assign(filters, { personTypeId: ObjectId(personTypeId) })
    if (tenantId) Object.assign(filters, { tenantId: ObjectId(tenantId) })
    if (search) {
      Object.assign(filters, {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      })
    }
    if (limit) Object.assign(filters, { limit: Number(limit) })
    if (page) Object.assign(filters, { page: Number(page) })

    return filters
  }
}
