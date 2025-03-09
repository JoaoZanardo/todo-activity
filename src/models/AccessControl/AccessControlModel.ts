import { ClientSession, Types } from 'mongoose'

import { IDeleteModelProps, IListModelsFilters, IModel, IUpdateModelProps, ModelAction } from '../../core/interfaces/Model'
import Model from '../../core/Model'
import { DateUtils } from '../../utils/Date'
import ObjectId from '../../utils/ObjectId'
import { AccessPointModel } from '../AccessPoint/AccessPointModel'
import { AccessReleaseModel } from '../AccessRelease/AccessReleaseModel'

export interface IListAccessControlsFilters extends IListModelsFilters {
  personTypeId?: Types.ObjectId
  areaId?: Types.ObjectId
  accessAreaId?: Types.ObjectId
  accessPointId?: Types.ObjectId
  equipmentId?: Types.ObjectId
  type?: AccessControlType
  initDate?: Date
  endDate?: Date
  personId?: Types.ObjectId
}

export interface IUpdateAccessControlProps extends IUpdateModelProps<IAccessControl> { }

export interface IDeleteAccessControlProps extends IDeleteModelProps { }

export interface ICreateAccessControlByEquipmentIpProps {
  picture: string
  equipmentIp: string
  personId: Types.ObjectId
  session: ClientSession
  releaseType: AccessControlReleaseType
}

export interface IValidateAccessControlCreationProps {
  accessRelease: AccessReleaseModel | null

  accessPoint: AccessPointModel
  tenantId: Types.ObjectId
  session: ClientSession
}

export enum AccessControlReleaseType {
  'manual' = 'manual',
  'facial' = 'facial',
  'qrCode' = 'qrCode'
}

export enum AccessControlType {
  'entry' = 'entry',
  'exit' = 'exit'
}

export interface IAccessControlCreationServiceExecuteProps {
  picture?: string
  observation?: string
  userId?: Types.ObjectId
  equipment?: {
    id?: Types.ObjectId
    name?: string
    ip?: string
  }

  personId: Types.ObjectId
  tenantId: Types.ObjectId
  accessPointId: Types.ObjectId
  session: ClientSession
  releaseType: AccessControlReleaseType
}

export interface IAccessControl extends IModel {
  responsible?: {
    id?: Types.ObjectId
    name?: string
  },
  observation?: string
  type?: AccessControlType
  equipment?: {
    id?: Types.ObjectId
    name?: string
    ip?: string
  }

  releaseType: AccessControlReleaseType
  accessReleaseId: Types.ObjectId
  person: {
    picture?: string
    personTypeCategory?: {
      id?: Types.ObjectId
      name?: string
    }

    id: Types.ObjectId
    name: string
    personType: {
      id: Types.ObjectId
      name: string
    }
  }
  accessPoint: {
    area?: {
      id: Types.ObjectId
      name: string
    }
    accessArea?: {
      id: Types.ObjectId
      name: string
    }

    id: Types.ObjectId
    name: string
  }
}

export class AccessControlModel extends Model<IAccessControl> {
  private _responsible?: IAccessControl['responsible']
  private _observation?: IAccessControl['observation']
  private _type?: IAccessControl['type']
  private _equipment?: IAccessControl['equipment']

  private _releaseType: IAccessControl['releaseType']
  private _person: IAccessControl['person']
  private _accessPoint: IAccessControl['accessPoint']
  private _accessReleaseId: IAccessControl['accessReleaseId']

  constructor (accessControl: IAccessControl) {
    super(accessControl)

    this._responsible = accessControl.responsible
    this._equipment = accessControl.equipment
    this._person = accessControl.person
    this._observation = accessControl.observation
    this._type = accessControl.type

    this._releaseType = accessControl.releaseType
    this._accessPoint = accessControl.accessPoint
    this._accessReleaseId = ObjectId(accessControl.accessReleaseId)
    this.actions = accessControl.actions || [{
      action: ModelAction.create,
      date: DateUtils.getCurrent()
    }]
  }

  get object (): IAccessControl {
    return {
      _id: this._id,
      tenantId: this.tenantId,
      actions: this.actions,
      active: this.active,
      createdAt: this.createdAt,
      deletionDate: this.deletionDate,
      responsible: this._responsible,
      observation: this._observation,
      equipment: this._equipment,

      releaseType: this._releaseType,
      type: this._type,
      person: this._person,
      accessPoint: this._accessPoint,
      accessReleaseId: this._accessReleaseId
    }
  }

  get show () {
    return this.object
  }

  static listFilters (
    {
      search,
      limit,
      page,
      tenantId,
      type,
      personTypeId,
      areaId,
      accessAreaId,
      accessPointId,
      equipmentId,
      initDate,
      endDate,
      personId
    }: Partial<IListAccessControlsFilters>
  ): IListAccessControlsFilters {
    const filters = {
      deletionDate: undefined
    } as IListAccessControlsFilters

    if (initDate || endDate) {
      const createdAtFilter: any = {}

      if (initDate) {
        createdAtFilter.$gte = DateUtils.parse(initDate)
      }

      if (endDate) {
        createdAtFilter.$lte = DateUtils.parse(endDate)
      }

      Object.assign(filters, { createdAt: createdAtFilter })
    }

    if (personId) Object.assign(filters, { 'person.id': ObjectId(personId) })
    if (equipmentId) Object.assign(filters, { 'equipment.id': ObjectId(equipmentId) })
    if (personTypeId) Object.assign(filters, { 'person.personType.id': ObjectId(personTypeId) })
    if (areaId) Object.assign(filters, { 'accessPoint.area.id': ObjectId(areaId) })
    if (accessAreaId) Object.assign(filters, { 'accessPoint.accessArea.id': ObjectId(accessAreaId) })
    if (accessPointId) Object.assign(filters, { 'accessPoint.id': ObjectId(accessPointId) })
    if (type) Object.assign(filters, { type })
    if (tenantId) Object.assign(filters, { tenantId: ObjectId(tenantId) })
    if (search) {
      Object.assign(filters, {
        $or: [
          { 'person.name': { $regex: search, $options: 'i' } },
          { 'accessPoint.name': { $regex: search, $options: 'i' } },
          { 'accessPoint.area.name': { $regex: search, $options: 'i' } },
          { 'accessPoint.accessArea.name': { $regex: search, $options: 'i' } },
          { 'responsible.name': { $regex: search, $options: 'i' } },
          { observation: { $regex: search, $options: 'i' } }
        ]
      })
    }
    if (limit) Object.assign(filters, { limit: Number(limit) })
    if (page) Object.assign(filters, { page: Number(page) })

    return filters
  }
}
