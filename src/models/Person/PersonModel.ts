import { ClientSession, Types } from 'mongoose'

import { IListModelsFilters, IModel, ModelAction } from '../../core/interfaces/Model'
import Model from '../../core/Model'
import { DateUtils } from '../../utils/Date'

export interface IListPersonsFilters extends IListModelsFilters { }

export interface IUpdatePersonProps {
  responsibleId?: Types.ObjectId
  session?: ClientSession

  id: Types.ObjectId
  data: Partial<IPerson>
}

export enum PersonType {
  resident = 'resident',
  serviceProvider = 'serviceProvider',
  visitor = 'visitor',
  vip = 'vip',
  tenant = 'tenant',
  delivery = 'delivery'
}

export interface IPerson extends IModel {
  email?: string
  observation?: string
  contractInitDate?: Date
  contractEndDate?: Date

  name: string
  document: string
  type: PersonType
  phone: string
  address: {
    streetName: string
    streetNumber: number
  }
}

export class PersonModel extends Model<IPerson> {
  private _email?: IPerson['email']
  private _observation?: IPerson['observation']
  private _contractInitDate?: IPerson['contractInitDate']
  private _contractEndDate?: IPerson['contractEndDate']

  private _name: IPerson['name']
  private _document: IPerson['document']
  private _type: IPerson['type']
  private _phone: IPerson['phone']
  private _address: IPerson['address']

  constructor (person: IPerson) {
    super(person)

    this._email = person.email
    this._observation = person.observation
    this._contractInitDate = person.contractInitDate
    this._contractEndDate = person.contractEndDate

    this._name = person.name
    this._document = person.document
    this._type = person.type
    this._phone = person.phone
    this._address = person.address
    this._email = person.email
    this.actions = person.actions || [{
      action: ModelAction.create,
      date: DateUtils.getCurrent()
    }]
  }

  get object (): IPerson {
    return {
      _id: this._id,
      tenantId: this.tenantId,
      actions: this.actions,
      active: this.active,
      createdAt: this.createdAt,
      deletionDate: this.deletionDate,
      email: this._email,
      observation: this._observation,
      contractInitDate: this._contractInitDate,
      contractEndDate: this._contractEndDate,
      name: this._name,
      document: this._document,
      type: this._type,
      phone: this._phone,
      address: this._address
    }
  }

  get email (): IPerson['email'] {
    return this._email
  }

  get type (): IPerson['type'] {
    return this._type
  }

  get show () {
    return this.object
  }

  static listFilters (
    {
      search,
      limit,
      page
    }: Partial<IListPersonsFilters>
  ): IListPersonsFilters {
    const filters = {
      deletionDate: undefined
    } as IListPersonsFilters

    if (search) {
      Object.assign(filters, {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      })
    }
    if (limit) Object.assign(filters, { limit: Number(limit) })
    if (page) Object.assign(filters, { page: Number(page) })

    return filters
  }
}
