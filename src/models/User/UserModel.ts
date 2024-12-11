import { Types } from 'mongoose'

import { IListModelsFilters, IModel, IUpdateModelProps } from '../../core/interfaces/Model'
import Model from '../../core/Model'
import ObjectId from '../../utils/ObjectId'
import { IAccessGroup } from '../AccessGroup/AccessGroupModel'

export interface IListUsersFilters extends IListModelsFilters {
  accessGroupId?: Types.ObjectId
}

export interface IUpdateUserProps extends IUpdateModelProps<IUser> {}

export interface ITokenPayload {
  userId: Types.ObjectId
}

export interface ISignInProps {
  tenantId: Types.ObjectId
  email: string
  password: string
}

export interface IAuthenticatedProps {
  user: IUser
  token: string
}

export interface IFindUserByEmailProps {
  tenantId: Types.ObjectId
  email: string
}

export interface IUser extends IModel {
  admin?: boolean
  accessGroup?: IAccessGroup
  accessGroupId?: Types.ObjectId

  name: string
  email: string
  password: string
}

export class UserModel extends Model<IUser> {
  private _admin?: IUser['admin']
  private _accessGroup?: IUser['accessGroup']
  private _accessGroupId?: IUser['accessGroupId']

  private _name: IUser['name']
  private _email: IUser['email']
  private _password: IUser['password']

  constructor (user: IUser) {
    super(user)

    this._admin = user.admin
    this._accessGroup = user.accessGroup
    this._name = user.name
    this._email = user.email
    this._password = user.password
    this._accessGroupId = user.accessGroupId
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
      name: this._name,
      email: this._email,
      password: this._password,
      accessGroupId: this._accessGroupId
    }
  }

  get show (): IUser {
    return {
      ...this.object,
      accessGroup: this._accessGroup
    }
  }

  static listFilters (
    {
      search,
      limit,
      page,
      accessGroupId
    }: Partial<IListUsersFilters>
  ): IListUsersFilters {
    const filters = {
      deletionDate: undefined
    } as IListUsersFilters

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
