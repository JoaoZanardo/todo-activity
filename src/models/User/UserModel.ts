import { ClientSession, Types } from 'mongoose'

import { IListModelsFilters, IModel, IUpdateModelProps } from '../../core/interfaces/Model'
import Model from '../../core/Model'
import ObjectId from '../../utils/ObjectId'
import { IAccessGroup } from '../AccessGroup/AccessGroupModel'
import { IPerson } from '../Person/PersonModel'

export interface IResetUserPasswordProps {
  password: string
  token: string
  session: ClientSession
  tenantId: Types.ObjectId
}

export interface IListUsersFilters extends IListModelsFilters {
  accessGroupId?: Types.ObjectId
}

export interface IUpdateUserProps extends IUpdateModelProps<IUser> {}

export interface ITokenPayload {
  userId: Types.ObjectId
}

export interface ISignInProps {
  tenantId: Types.ObjectId
  login: string
  password: string
}

export interface ISignUpProps {
  email: string
  tenantId: Types.ObjectId
  login: string
  password: string
  session: ClientSession
}

export interface IAuthenticatedProps {
  user: IUser
  token: string
}

export interface IFindUserByLoginProps {
  tenantId: Types.ObjectId
  login: string
}

export interface IFindUserByEmailProps {
  tenantId: Types.ObjectId
  email: string
}

export enum UserCreationType {
  default = 'default',
  app = 'app'
}

export interface IUser extends IModel {
  admin?: boolean
  accessGroupId?: Types.ObjectId
  email?: string
  personId?: Types.ObjectId
  creationType?: UserCreationType

  accessGroup?: IAccessGroup
  person?: IPerson

  name: string
  login: string
  password: string
}

export class UserModel extends Model<IUser> {
  private _admin?: IUser['admin']
  private _accessGroupId?: IUser['accessGroupId']
  private _email?: IUser['email']
  private _personId?: IUser['personId']
  private _creationType?: IUser['creationType']

  private _accessGroup?: IUser['accessGroup']
  private _person?: IUser['person']

  private _name: IUser['name']
  private _login: IUser['login']
  private _password: IUser['password']

  constructor (user: IUser) {
    super(user)

    this._admin = user.admin
    this._email = user.email
    this._personId = user.personId
    this._creationType = user.creationType

    this._accessGroup = user.accessGroup
    this._person = user.person

    this._name = user.name
    this._login = user.login
    this._password = user.password
    this._accessGroupId = user.accessGroupId
  }

  get accessGroup (): IUser['accessGroup'] {
    return this._accessGroup
  }

  get person (): IUser['person'] {
    return this._person
  }

  get object (): IUser {
    return {
      _id: this._id,
      tenantId: this.tenantId,
      actions: this.actions,
      active: this.active,
      createdAt: this.createdAt,
      deletionDate: this.deletionDate,
      admin: this._admin,
      email: this._email,
      name: this._name,
      login: this._login,
      password: this._password,
      accessGroupId: this._accessGroupId,
      creationType: this._creationType,
      personId: this._personId
    }
  }

  get show (): IUser {
    return {
      ...this.object,
      accessGroup: this._accessGroup,
      person: this._person
    }
  }

  static listFilters (
    {
      search,
      limit,
      page,
      accessGroupId,
      tenantId
    }: Partial<IListUsersFilters>
  ): IListUsersFilters {
    const filters = {
      deletionDate: undefined
    } as IListUsersFilters

    if (tenantId) Object.assign(filters, { tenantId: ObjectId(tenantId) })
    if (accessGroupId) Object.assign(filters, { accessGroupId: ObjectId(accessGroupId) })
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
