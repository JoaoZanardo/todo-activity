import { Types } from 'mongoose'

import { IDeleteModelProps, IListModelsFilters, IModel, IUpdateModelProps, ModelAction } from '../../core/interfaces/Model'
import Model from '../../core/Model'
import { DateUtils } from '../../utils/Date'
import ObjectId from '../../utils/ObjectId'

export interface IListWorkSchedulesFilters extends IListModelsFilters { }

export interface IUpdateWorkScheduleProps extends IUpdateModelProps<IWorkSchedule> { }

export interface IDeleteWorkScheduleProps extends IDeleteModelProps { }

export interface IFindWorkScheduleByDocumentProps {
  tenantId: Types.ObjectId
  document: string
}

export enum Day {
  sunday = 'sunday',
  monday = 'monday',
  tuesday = 'tuesday',
  wednesday = 'wednesday',
  thursday = 'thursday',
  friday = 'friday',
  saturday = 'saturday',
}

export const DayValues = Object.values(Day)

export interface IWorkSchedule extends IModel {
  description?: string

  name: string
  days: Array<Day>
  startTime: string
  endTime: string
}

export class WorkScheduleModel extends Model<IWorkSchedule> {
  private _description?: IWorkSchedule['description']

  private _name: IWorkSchedule['name']
  private _days: IWorkSchedule['days']
  private _startTime: IWorkSchedule['startTime']
  private _endTime: IWorkSchedule['endTime']

  constructor (workSchedule: IWorkSchedule) {
    super(workSchedule)

    this._description = workSchedule.description

    this._name = workSchedule.name
    this._days = workSchedule.days
    this._startTime = workSchedule.startTime
    this._endTime = workSchedule.endTime
    this.actions = workSchedule.actions || [{
      action: ModelAction.create,
      date: DateUtils.getCurrent()
    }]
  }

  get object (): IWorkSchedule {
    return {
      _id: this._id,
      tenantId: this.tenantId,
      actions: this.actions,
      active: this.active,
      createdAt: this.createdAt,
      deletionDate: this.deletionDate,
      description: this._description,
      name: this._name,
      days: this._days,
      startTime: this._startTime,
      endTime: this._endTime
    }
  }

  get show () {
    return this.object
  }

  get name (): IWorkSchedule['name'] {
    return this._name
  }

  static listFilters (
    {
      search,
      limit,
      page,
      tenantId
    }: Partial<IListWorkSchedulesFilters>
  ): IListWorkSchedulesFilters {
    const filters = {
      deletionDate: undefined
    } as IListWorkSchedulesFilters

    if (tenantId) Object.assign(filters, { tenantId: ObjectId(tenantId) })
    if (search) {
      Object.assign(filters, {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      })
    }
    if (limit) Object.assign(filters, { limit: Number(limit) })
    if (page) Object.assign(filters, { page: Number(page) })

    return filters
  }
}
