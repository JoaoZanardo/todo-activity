import { Types } from 'mongoose'

import { IDeleteModelProps, IListModelsFilters, IModel, IUpdateModelProps, ModelAction } from '../../core/interfaces/Model'
import Model from '../../core/Model'
import { DateUtils } from '../../utils/Date'
import ObjectId from '../../utils/ObjectId'

export interface IListPersonsFilters extends IListModelsFilters {
  personTypeId?: Types.ObjectId
}

export interface IUpdatePersonProps extends IUpdateModelProps<IPerson> { }

export interface IDeletePersonProps extends IDeleteModelProps { }

export interface IFindPersonByDocumentProps {
  tenantId: Types.ObjectId
  document: string
}

export interface IPerson extends IModel {
  email?: string
  observation?: string
  contractInitDate?: Date
  contractEndDate?: Date
  phone?: string
  address?: {
    streetName: string
    streetNumber: number
  }
  cnh?: string
  cnhExpirationDate?: Date
  workScheduleId?: string
  responsibleId?: string
  cnpj?: string
  register?: string
  role?: string
  rg?: string
  passport?: string

  personTypeId: Types.ObjectId
  name: string
  document: string
}

export class PersonModel extends Model<IPerson> {
  private _email?: IPerson['email']
  private _observation?: IPerson['observation']
  private _contractInitDate?: IPerson['contractInitDate']
  private _contractEndDate?: IPerson['contractEndDate']
  private _phone?: IPerson['phone']
  private _address?: IPerson['address']
  private _cnh?: IPerson['cnh']
  private _cnhExpirationDate?: IPerson['cnhExpirationDate']
  private _workScheduleId?: IPerson['workScheduleId']
  private _responsibleId?: IPerson['responsibleId']
  private _cnpj?: IPerson['cnpj']
  private _register?: IPerson['register']
  private _role?: IPerson['role']
  private _rg?: IPerson['rg']
  private _passport?: IPerson['passport']

  private _personTypeId: IPerson['personTypeId']
  private _name: IPerson['name']
  private _document: IPerson['document']

  constructor (person: IPerson) {
    super(person)

    this._email = person.email
    this._email = person.email
    this._observation = person.observation
    this._contractInitDate = person.contractInitDate
    this._contractEndDate = person.contractEndDate
    this._cnh = person.cnh
    this._cnhExpirationDate = person.cnhExpirationDate
    this._workScheduleId = person.workScheduleId
    this._responsibleId = person.responsibleId
    this._cnpj = person.cnpj
    this._register = person.register
    this._role = person.role
    this._rg = person.rg
    this._passport = person.passport

    this._personTypeId = person.personTypeId
    this._name = person.name
    this._document = person.document
    this._phone = person.phone
    this._address = person.address
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
      phone: this._phone,
      address: this._address,
      personTypeId: this._personTypeId
    }
  }

  get show () {
    return this.object
  }

  get name (): IPerson['name'] {
    return this._name
  }

  get document (): IPerson['document'] {
    return this._document
  }

  static listFilters (
    {
      search,
      limit,
      page,
      personTypeId,
      tenantId
    }: Partial<IListPersonsFilters>
  ): IListPersonsFilters {
    const filters = {
      deletionDate: undefined
    } as IListPersonsFilters

    if (tenantId) Object.assign(filters, { tenantId: ObjectId(tenantId) })
    if (personTypeId) Object.assign(filters, { personTypeId: ObjectId(personTypeId) })
    if (search) {
      Object.assign(filters, {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { document: { $regex: search, $options: 'i' } },
          { 'address.streetName': { $regex: search, $options: 'i' } },
          { 'address.streetNumber': { $regex: search, $options: 'i' } }
        ]
      })
    }
    if (limit) Object.assign(filters, { limit: Number(limit) })
    if (page) Object.assign(filters, { page: Number(page) })

    return filters
  }
}
