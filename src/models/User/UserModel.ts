import { Types } from 'mongoose'

import { IListModelsFilters, IModel, IUpdateModelProps } from '../../core/interfaces/Model'
import Model from '../../core/Model'

export interface IListUsersFilters extends IListModelsFilters { }

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
  admin?: Types.ObjectId

  name: string
  email: string
  password: string
}

export class UserModel extends Model<IUser> {
  private _admin?: IUser['admin']

  private _name: IUser['name']
  private _email: IUser['email']
  private _password: IUser['password']

  constructor (user: IUser) {
    super(user)

    this._admin = user.admin
    this._name = user.name
    this._email = user.email
    this._password = user.password
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
      password: this._password
    }
  }

  get show () {
    return this.object
  }

  static listFilters (
    {
      search,
      limit,
      page
    }: Partial<IListUsersFilters>
  ): IListUsersFilters {
    const filters = {
      deletionDate: undefined
    } as IListUsersFilters

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
