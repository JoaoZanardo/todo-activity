import { IDeleteModelProps, IListModelsFilters, IModel, IUpdateModelProps } from '../../core/interfaces/Model'
import Model from '../../core/Model'
import ObjectId from '../../utils/ObjectId'

export interface IListSynchronizationsFilters extends IListModelsFilters {}

export interface IUpdateSynchronizationProps extends IUpdateModelProps<ISynchronization> { }

export interface IDeleteSynchronizationProps extends IDeleteModelProps { }

export interface ISynchronization extends IModel {
  finished?: boolean
  endDate?: Date
  syncErrors?: Array<Object>
  executedsNumber?: number

  totalDocs: number
}

export class SynchronizationModel extends Model<ISynchronization> {
  private _executedsNumber: ISynchronization['executedsNumber']
  private _finished?: ISynchronization['finished']
  private _endDate?: ISynchronization['endDate']
  private _syncErrors?: ISynchronization['syncErrors']

  private _totalDocs: ISynchronization['totalDocs']

  constructor (synchronization: ISynchronization) {
    super(synchronization)

    this._finished = synchronization.finished
    this._endDate = synchronization.endDate
    this._syncErrors = synchronization.syncErrors
    this._executedsNumber = synchronization.executedsNumber

    this._totalDocs = synchronization.totalDocs
  }

  get syncErrors (): ISynchronization['syncErrors'] {
    return this._syncErrors
  }

  get totalDocs (): ISynchronization['totalDocs'] {
    return this._totalDocs
  }

  get executedsNumber (): ISynchronization['executedsNumber'] {
    return this._executedsNumber
  }

  get object (): ISynchronization {
    return {
      _id: this._id,
      tenantId: this.tenantId,
      actions: this.actions,
      active: this.active,
      createdAt: this.createdAt,
      deletionDate: this.deletionDate,
      finished: this._finished,
      endDate: this._endDate,
      syncErrors: this._syncErrors,
      totalDocs: this._totalDocs,
      executedsNumber: this._executedsNumber
    }
  }

  static listFilters (
    {
      search,
      limit,
      page,
      tenantId
    }: Partial<IListSynchronizationsFilters>
  ): IListSynchronizationsFilters {
    const filters = {
      deletionDate: undefined
    } as IListSynchronizationsFilters

    if (tenantId) Object.assign(filters, { tenantId: ObjectId(tenantId) })
    if (search) {
      Object.assign(filters, {
        $or: [
          { observation: { $regex: search, $options: 'i' } }
        ]
      })
    }
    if (limit) Object.assign(filters, { limit: Number(limit) })
    if (page) Object.assign(filters, { page: Number(page) })

    return filters
  }
}
