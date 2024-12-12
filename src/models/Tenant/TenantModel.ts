import { Types } from 'mongoose'

import { IModel, IModelAction } from '../../core/interfaces/Model'
import { DateUtils } from '../../utils/Date'
import { UserModel } from '../User/UserModel'

export interface ICreatedTenatTemplateProps {
  user: UserModel
  tenant: TenantModel
  password: string
}

export interface ITenant {
  _id?: Types.ObjectId
  active?: boolean
  createdAt?: Date
  actions?: Array<IModelAction>
  deletionDate?: Date
  color?: string
  image?: string
  freeTrial?: boolean
  modules?: Array<string>
  usersNumber?: number
  peopleNumber?: number

  name: string
  email: string
}

export class TenantModel {
  public _id?: IModel['_id']
  public active?: IModel['active']
  public actions?: IModel['actions']
  protected createdAt?: IModel['createdAt']
  protected deletionDate?: IModel['deletionDate']
  private _color?: ITenant['color']
  private _image?: ITenant['image']
  private _modules?: ITenant['modules']
  private _usersNumber?: ITenant['usersNumber']
  private _peopleNumber?: ITenant['peopleNumber']
  private _freeTrial?: ITenant['freeTrial']

  private _name: ITenant['name']
  private _email: ITenant['email']

  constructor (tenant: ITenant) {
    this._id = tenant._id
    this.active = tenant.active
    this.actions = tenant.actions || []
    this.createdAt = tenant.createdAt || DateUtils.getCurrent()
    this.deletionDate = tenant.deletionDate
    this._color = tenant.color
    this._image = tenant.image
    this._freeTrial = tenant.freeTrial
    this._modules = tenant.modules
    this._usersNumber = tenant.usersNumber
    this._peopleNumber = tenant.peopleNumber

    this._name = tenant.name
    this._email = tenant.email
  }

  get object (): ITenant {
    return {
      _id: this._id,
      color: this._color,
      image: this._image,
      actions: this.actions,
      active: this.active,
      createdAt: this.createdAt,
      deletionDate: this.deletionDate,
      freeTrial: this._freeTrial,
      modules: this._modules,
      usersNumber: this._usersNumber,
      peopleNumber: this._peopleNumber,
      name: this._name,
      email: this._email
    }
  }

  get name (): ITenant['name'] {
    return this._name
  }

  get email (): ITenant['email'] {
    return this._email
  }
}
