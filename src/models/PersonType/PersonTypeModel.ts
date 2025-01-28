import { IDeleteModelProps, IListModelsFilters, IModel, IUpdateModelProps, ModelAction } from '../../core/interfaces/Model'
import Model from '../../core/Model'
import { DateUtils } from '../../utils/Date'
import ObjectId from '../../utils/ObjectId'

export interface IListPersonTypesFilters extends IListModelsFilters { }

export interface IUpdatePersonTypeProps extends IUpdateModelProps<IPersonType> {}

export interface IDeletePersonTypeProps extends IDeleteModelProps {}

export enum TimeUnit {
  hour = 'hour',
  day = 'day',
  month = 'month',
  year = 'year',
}

export interface ExpiringTime {
  value: number,
  unit: TimeUnit
}

export interface IPersonType extends IModel {
  description?: string
  appAccess?: boolean
  expiringTime?: ExpiringTime

  name: string
}

export class PersonTypeModel extends Model<IPersonType> {
  private _description?: IPersonType['description']
  private _appAccess?: IPersonType['appAccess']
  private _expiringTime?: IPersonType['expiringTime']

  private _name: IPersonType['name']

  constructor (personType: IPersonType) {
    super(personType)

    this._description = personType.description
    this._appAccess = personType.appAccess
    this._expiringTime = personType.expiringTime

    this._name = personType.name
    this.actions = personType.actions || [{
      action: ModelAction.create,
      date: DateUtils.getCurrent()
    }]
  }

  get object (): IPersonType {
    return {
      _id: this._id,
      tenantId: this.tenantId,
      actions: this.actions,
      active: this.active,
      createdAt: this.createdAt,
      deletionDate: this.deletionDate,
      description: this._description,
      name: this._name,
      appAccess: this._appAccess,
      expiringTime: this._expiringTime
    }
  }

  get show () {
    return this.object
  }

  get name (): IPersonType['name'] {
    return this._name
  }

  static listFilters (
    {
      search,
      limit,
      page,
      tenantId
    }: Partial<IListPersonTypesFilters>
  ): IListPersonTypesFilters {
    const filters = {
      deletionDate: undefined
    } as IListPersonTypesFilters

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
