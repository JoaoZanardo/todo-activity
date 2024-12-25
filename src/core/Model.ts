import { DateUtils } from '../utils/Date'
import { IModel, ModelAction } from './interfaces/Model'

export default abstract class Model<T> {
  public _id?: IModel['_id']
  public tenantId: IModel['tenantId']
  public active?: IModel['active']
  public actions?: IModel['actions']
  protected createdAt?: IModel['createdAt']
  protected deletionDate?: IModel['deletionDate']

  constructor (model: T & IModel) {
    this._id = model._id
    this.tenantId = model.tenantId
    this.active = model.active
    this.actions = model.actions || [{
      action: ModelAction.create,
      date: DateUtils.getCurrent()
    }]
    this.createdAt = model.createdAt || DateUtils.getCurrent()
    this.deletionDate = model.deletionDate
  }

  abstract get object (): Record<string, any>
}
