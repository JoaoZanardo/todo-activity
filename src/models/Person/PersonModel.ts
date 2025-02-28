import { ClientSession, Types } from 'mongoose'

import { IListModelsFilters, IModel, ModelAction } from '../../core/interfaces/Model'
import Model from '../../core/Model'
import { DateUtils } from '../../utils/Date'
import { format } from '../../utils/format'
import { getRandomCode } from '../../utils/getRandomCode'
import ObjectId from '../../utils/ObjectId'
import { IAccessControl } from '../AccessControl/AccessControlModel'
import { IPersonType, UpdationTime } from '../PersonType/PersonTypeModel'

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
  bondAreasIds?: Array<Types.ObjectId>
  lastAccess?: boolean
  appAccess?: boolean
  updatedData?: boolean
}

export interface IUpdatePersonProps {
  responsibleId?: Types.ObjectId

  session: ClientSession
  id: Types.ObjectId
  tenantId: Types.ObjectId
  data: Partial<IPerson>
}

export interface IDeletePersonProps {
  session: ClientSession
  id: Types.ObjectId
  tenantId: Types.ObjectId
  responsibleId: Types.ObjectId
}

export interface IFindPersonByCpfProps {
  cpf: string
  tenantId: Types.ObjectId
}

export interface IFindPersonByCnhProps {
  cnh: string
  tenantId: Types.ObjectId
}

export interface IFindAllByPersonTypeId {
  personTypeId: Types.ObjectId
  tenantId: Types.ObjectId
}

export enum PersonCreationType {
  default = 'default',
  invite = 'invite'
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
  cnpj?: string
  register?: string
  role?: string
  rg?: string
  passport?: string
  cpf?: string
  picture?: string
  code?: string
  landline?: string
  creationType?: PersonCreationType
  responsibleId?: Types.ObjectId
  personTypeCategoryId?: Types.ObjectId
  bondAreasIds?: Array<Types.ObjectId>
  userId?: Types.ObjectId
  appAccess?: boolean

  updationInfo?: {
    updatedData?: boolean
    lastUpdationdate?: Date
    nextUpdationdate?: Date
    updationTime?: UpdationTime
  }

  personType?: IPersonType
  lastAccessControl?: IAccessControl

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
  private _cnpj?: IPerson['cnpj']
  private _register?: IPerson['register']
  private _role?: IPerson['role']
  private _rg?: IPerson['rg']
  private _passport?: IPerson['passport']
  private _cpf?: IPerson['cpf']
  private _picture?: IPerson['picture']
  private _code?: IPerson['code']
  private _landline?: IPerson['landline']
  private _creationType?: IPerson['creationType']
  private _responsibleId?: IPerson['responsibleId']
  private _personTypeCategoryId?: IPerson['personTypeCategoryId']
  private _bondAreasIds?: IPerson['bondAreasIds']
  private _userId?: IPerson['userId']
  private _appAccess?: IPerson['appAccess']
  private _updationInfo?: IPerson['updationInfo']

  private _personType?: IPerson['personType']
  private _lastAccessControl?: IPerson['lastAccessControl']

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
    this._bondAreasIds = person.bondAreasIds ?? []
    this._code = person.code || getRandomCode()
    this._landline = person.landline
    this._creationType = person.creationType ?? PersonCreationType.default
    this._userId = person.userId
    this._appAccess = person.appAccess
    this._updationInfo = person.updationInfo

    this._personTypeId = person.personTypeId
    this._name = person.name
    this._phone = person.phone
    this._address = person.address
    this.actions = person.actions || [{
      action: ModelAction.create,
      date: DateUtils.getCurrent()
    }]
  }

  get updationInfo (): IPerson['updationInfo'] {
    return this._updationInfo
  }

  get personTypeId (): IPerson['personTypeId'] {
    return this._personTypeId
  }

  get personType (): IPerson['personType'] {
    return this._personType
  }

  get cpf (): IPerson['cpf'] {
    return this._cpf
  }

  get code (): IPerson['code'] {
    return this._code
  }

  get appAccess (): IPerson['appAccess'] {
    return this._appAccess
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
      bondAreasIds: this._bondAreasIds,
      code: this._code,
      landline: this._landline,
      userId: this._userId,
      creationType: this._creationType,
      appAccess: this._appAccess,
      updationInfo: this._updationInfo
    }
  }

  get show () {
    return {
      ...this.object,
      personType: this._personType,
      lastAccessControl: this._lastAccessControl
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
      bondAreaId,
      lastAccess,
      appAccess,
      updatedData
    }: Partial<IListPersonsFilters>
  ): IListPersonsFilters {
    const filters = {
      deletionDate: undefined
    } as IListPersonsFilters

    if (updatedData) Object.assign(filters, { 'updationInfo.updatedData': format.boolean(updatedData) })
    if (appAccess) Object.assign(filters, { appAccess: format.boolean(appAccess) })
    if (lastAccess) Object.assign(filters, { lastAccess: format.boolean(lastAccess) })
    if (cnh) Object.assign(filters, { 'cnh.value': { $regex: cnh, $options: 'i' } })
    if (cpf) Object.assign(filters, { cpf: { $regex: cpf, $options: 'i' } })
    if (cnpj) Object.assign(filters, { cnpj: { $regex: cnpj, $options: 'i' } })
    if (rg) Object.assign(filters, { rg: { $regex: rg, $options: 'i' } })
    if (passport) Object.assign(filters, { passport: { $regex: passport, $options: 'i' } })
    if (register) Object.assign(filters, { register: { $regex: register, $options: 'i' } })
    if (name) Object.assign(filters, { name: { $regex: name, $options: 'i' } })
    if (email) Object.assign(filters, { email: { $regex: email, $options: 'i' } })

    if (tenantId) Object.assign(filters, { tenantId: ObjectId(tenantId) })
    if (bondAreaId) Object.assign(filters, { bondAreasIds: { $in: [ObjectId(bondAreaId)] } })
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
