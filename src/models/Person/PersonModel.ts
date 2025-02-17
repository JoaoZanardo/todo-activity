import { Types } from 'mongoose'

import { IDeleteModelProps, IListModelsFilters, IModel, IUpdateModelProps, ModelAction } from '../../core/interfaces/Model'
import Model from '../../core/Model'
import { DateUtils } from '../../utils/Date'
import { getPersonCode } from '../../utils/getPersonCode'
import ObjectId from '../../utils/ObjectId'
import { IAccessArea } from '../AccessArea/AccessAreaModel'
import { IAccessControl } from '../AccessControl/AccessControlModel'
import { IAccessPoint } from '../AccessPoint/AccessPointModel'
import { IPersonType } from '../PersonType/PersonTypeModel'

export interface IListPersonsFilters extends IListModelsFilters {
  personTypeId?: Types.ObjectId
  name?: string
  email?: string
  cpf?: string
  cnh?: string
  rg?: string
  passport?: string
  cnpj?: string
  register?: string
  bondAreaId?: Types.ObjectId
}

export interface IUpdatePersonProps extends IUpdateModelProps<IPerson> { }

export interface IDeletePersonProps extends IDeleteModelProps { }

export interface IFindPersonByCpfProps {
  cpf: string
  tenantId: Types.ObjectId
}

export interface IFindAllByPersonTypeId {
  personTypeId: Types.ObjectId
  tenantId: Types.ObjectId
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
  cnh?: {
    value: string
    expirationDate: Date
  }
  responsibleId?: string
  cnpj?: string
  register?: string
  role?: string
  rg?: string
  passport?: string
  cpf?: string
  picture?: string
  personTypeCategoryId?: string
  personType?: IPersonType
  lastAccessControl?: IAccessControl
  lastAccessPoint?: IAccessPoint
  lastAccessArea?: IAccessArea
  bondAreaId?: Types.ObjectId
  code?: string
  landline?: string

  personTypeId: Types.ObjectId
  name: string
}

export class PersonModel extends Model<IPerson> {
  private _email?: IPerson['email']
  private _observation?: IPerson['observation']
  private _contractInitDate?: IPerson['contractInitDate']
  private _contractEndDate?: IPerson['contractEndDate']
  private _phone?: IPerson['phone']
  private _address?: IPerson['address']
  private _cnh?: IPerson['cnh']
  private _responsibleId?: IPerson['responsibleId']
  private _cnpj?: IPerson['cnpj']
  private _register?: IPerson['register']
  private _role?: IPerson['role']
  private _rg?: IPerson['rg']
  private _passport?: IPerson['passport']
  private _cpf?: IPerson['cpf']
  private _picture?: IPerson['picture']
  private _personTypeCategoryId?: IPerson['personTypeCategoryId']
  private _personType?: IPerson['personType']
  private _lastAccessControl?: IPerson['lastAccessControl']
  private _lastAccessPoint?: IPerson['lastAccessPoint']
  private _lastAccessArea?: IPerson['lastAccessArea']
  private _bondAreaId?: IPerson['bondAreaId']
  private _code?: IPerson['code']
  private _landline?: IPerson['landline']

  private _personTypeId: IPerson['personTypeId']
  private _name: IPerson['name']

  constructor (person: IPerson) {
    super(person)

    this._email = person.email
    this._email = person.email
    this._observation = person.observation
    this._contractInitDate = person.contractInitDate
    this._contractEndDate = person.contractEndDate
    this._cnh = person.cnh
    this._responsibleId = person.responsibleId
    this._cnpj = person.cnpj
    this._register = person.register
    this._role = person.role
    this._rg = person.rg
    this._passport = person.passport
    this._cpf = person.cpf
    this._picture = person.picture
    this._personTypeCategoryId = person.personTypeCategoryId
    this._personType = person.personType
    this._lastAccessControl = person.lastAccessControl
    this._lastAccessPoint = person.lastAccessPoint
    this._lastAccessArea = person.lastAccessArea
    this._bondAreaId = person.bondAreaId
    this._code = person.code || getPersonCode()
    this._landline = person.landline

    this._personTypeId = person.personTypeId
    this._name = person.name
    this._phone = person.phone
    this._address = person.address
    this.actions = person.actions || [{
      action: ModelAction.create,
      date: DateUtils.getCurrent()
    }]
  }

  get personTypeId (): IPerson['personTypeId'] {
    return this._personTypeId
  }

  get cpf (): IPerson['cpf'] {
    return this._cpf
  }

  get code (): IPerson['code'] {
    return this._code
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
      phone: this._phone,
      address: this._address,
      personTypeId: this._personTypeId,
      cnh: this._cnh,
      responsibleId: this._responsibleId,
      cnpj: this._cnpj,
      register: this._register,
      role: this._role,
      rg: this._rg,
      passport: this._passport,
      cpf: this._cpf,
      picture: this._picture,
      personTypeCategoryId: this._personTypeCategoryId,
      bondAreaId: this._bondAreaId,
      code: this._code,
      landline: this._landline
    }
  }

  get show () {
    return {
      ...this.object,
      personType: this._personType,
      lastAccessControl: this._lastAccessControl,
      lastAccessPoint: this._lastAccessPoint,
      lastAccessArea: this._lastAccessArea
    }
  }

  get name (): IPerson['name'] {
    return this._name
  }

  static listFilters (
    {
      search,
      limit,
      page,
      personTypeId,
      tenantId,
      cnh,
      cnpj,
      email,
      name,
      passport,
      register,
      rg,
      cpf,
      bondAreaId
    }: Partial<IListPersonsFilters>
  ): IListPersonsFilters {
    const filters = {
      deletionDate: undefined
    } as IListPersonsFilters

    if (cnh) Object.assign(filters, { 'cnh.value': { $regex: cnh, $options: 'i' } })
    if (cpf) Object.assign(filters, { cpf: { $regex: cpf, $options: 'i' } })
    if (cnpj) Object.assign(filters, { cnpj: { $regex: cnpj, $options: 'i' } })
    if (rg) Object.assign(filters, { rg: { $regex: rg, $options: 'i' } })
    if (passport) Object.assign(filters, { passport: { $regex: passport, $options: 'i' } })
    if (register) Object.assign(filters, { register: { $regex: register, $options: 'i' } })
    if (name) Object.assign(filters, { name: { $regex: name, $options: 'i' } })
    if (email) Object.assign(filters, { email: { $regex: email, $options: 'i' } })

    if (tenantId) Object.assign(filters, { tenantId: ObjectId(tenantId) })
    if (bondAreaId) Object.assign(filters, { bondAreaId: ObjectId(bondAreaId) })
    if (personTypeId) Object.assign(filters, { personTypeId: ObjectId(personTypeId) })
    if (search) {
      Object.assign(filters, {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { cpf: { $regex: search, $options: 'i' } },
          { cnh: { $regex: search, $options: 'i' } },
          { rg: { $regex: search, $options: 'i' } },
          { passport: { $regex: search, $options: 'i' } },
          { cnpj: { $regex: search, $options: 'i' } },
          { register: { $regex: search, $options: 'i' } },
          { 'cnh.value': { $regex: search, $options: 'i' } }
        ]
      })
    }
    if (limit) Object.assign(filters, { limit: Number(limit) })
    if (page) Object.assign(filters, { page: Number(page) })

    return filters
  }
}
