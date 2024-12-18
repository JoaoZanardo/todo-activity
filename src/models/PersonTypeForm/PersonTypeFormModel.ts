import { Types } from 'mongoose'

import { IDeleteModelProps, IListModelsFilters, IModel, IUpdateModelProps, ModelAction } from '../../core/interfaces/Model'
import Model from '../../core/Model'
import { DateUtils } from '../../utils/Date'
import ObjectId from '../../utils/ObjectId'

export interface IListPersonTypeFormsFilters extends IListModelsFilters { }

export interface IUpdatePersonTypeFormProps extends IUpdateModelProps<IPersonTypeForm> { }

export interface IDeletePersonTypeFormProps extends IDeleteModelProps { }

export interface IFindPersonTypeFormByPersonTypeIdProps {
  personTypeId: Types.ObjectId
  tenantId: Types.ObjectId
}

export enum InputType {
  select = 'select',
  text = 'text',
  number = 'number',
  date = 'date',
  time = 'time',
  file = 'file'
}

export const InputTypeValues = Object.values(InputType)

interface ISelectOption {
  label: string
  value: string
}

interface IField {
  key: string
  type: InputType
  options?: Array<ISelectOption>
  required?: boolean
}

export interface IPersonTypeForm extends IModel {
  personTypeId: Types.ObjectId
  fields: Array<IField>
}

export class PersonTypeFormModel extends Model<IPersonTypeForm> {
  private _personTypeId: IPersonTypeForm['personTypeId']
  private _fields: IPersonTypeForm['fields']

  constructor (personTypeForm: IPersonTypeForm) {
    super(personTypeForm)

    this._personTypeId = personTypeForm.personTypeId
    this._fields = personTypeForm.fields
    this.actions = personTypeForm.actions || [{
      action: ModelAction.create,
      date: DateUtils.getCurrent()
    }]
  }

  get object (): IPersonTypeForm {
    return {
      _id: this._id,
      tenantId: this.tenantId,
      actions: this.actions,
      active: this.active,
      createdAt: this.createdAt,
      deletionDate: this.deletionDate,
      personTypeId: this._personTypeId,
      fields: this._fields
    }
  }

  get show () {
    return this.object
  }

  get personTypeId (): IPersonTypeForm['personTypeId'] {
    return this._personTypeId
  }

  static listFilters (
    {
      search,
      limit,
      page,
      tenantId
    }: Partial<IListPersonTypeFormsFilters>
  ): IListPersonTypeFormsFilters {
    const filters = {
      deletionDate: undefined
    } as IListPersonTypeFormsFilters

    if (tenantId) Object.assign(filters, { tenantId: ObjectId(tenantId) })
    if (search) {
      Object.assign(filters, {
        $or: []
      })
    }
    if (limit) Object.assign(filters, { limit: Number(limit) })
    if (page) Object.assign(filters, { page: Number(page) })

    return filters
  }
}
