import { IModel } from '../../core/interfaces/Model'
import Model from '../../core/Model'

export interface ITenant extends IModel {
  name: string
  color: string
  image: string
  freeTrial: boolean
  modules: Array<string>
  usersNumber: number
}

export class TenantModel extends Model<ITenant> {
  private _name: ITenant['name']
  private _color: ITenant['color']
  private _image: ITenant['image']
  private _freeTrial: ITenant['freeTrial']
  private _modules: ITenant['modules']
  private _usersNumber: ITenant['usersNumber']

  constructor (tenant: ITenant) {
    super(tenant)

    this._name = tenant.name
    this._color = tenant.color
    this._image = tenant.image
    this._freeTrial = tenant.freeTrial
    this._modules = tenant.modules
    this._usersNumber = tenant.usersNumber
  }

  get usersNumber (): ITenant['usersNumber'] {
    return this._usersNumber
  }

  get object (): ITenant {
    return {
      _id: this._id,
      tenantId: this.tenantId,
      name: this._name,
      color: this._color,
      image: this._image,
      actions: this.actions,
      active: this.active,
      createdAt: this.createdAt,
      deletionDate: this.deletionDate,
      freeTrial: this._freeTrial,
      modules: this._modules,
      usersNumber: this._usersNumber
    }
  }
}
