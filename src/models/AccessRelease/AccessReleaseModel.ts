import { ClientSession, Types } from 'mongoose'

import { IDeleteModelProps, IListModelsFilters, IModel, IUpdateModelProps, ModelAction } from '../../core/interfaces/Model'
import Model from '../../core/Model'
import { IPerson, PersonModel } from '../../models/Person/PersonModel'
import { addExpiringTime } from '../../utils/addExpiringTime'
import { DateUtils } from '../../utils/Date'
import ObjectId from '../../utils/ObjectId'
import { IAccessPoint } from '../AccessPoint/AccessPointModel'
import { IEquipment } from '../Equipment/EquipmentModel'
import { ExpiringTime, IPersonType } from '../PersonType/PersonTypeModel'
import { IPersonTypeCategory } from '../PersonTypeCategory/PersonTypeCategoryModel'

export interface IListAccessReleasesFilters extends IListModelsFilters {
  personId?: Types.ObjectId
  personTypeId?: Types.ObjectId
  responsibleId?: Types.ObjectId
  personTypeCategoryId?: Types.ObjectId
  accessPointId?: Types.ObjectId
  noticeId?: Types.ObjectId
  status?: AccessReleaseStatus
  initDate?: Date
  endDate?: Date
}

export interface IUpdateAccessReleaseProps extends IUpdateModelProps<IAccessRelease> { }

export interface IDeleteAccessReleaseProps extends IDeleteModelProps { }

export interface IUpdateAccessReleaseSynchronizationsProps {
  id: Types.ObjectId
  synchronization: IAccessReleaseSynchronization
  tenantId: Types.ObjectId
  session: ClientSession
}

export interface IDisableAccessReleaseProps {
  responsibleId?: Types.ObjectId
  type?: RemoveAccessesFromPersonType

  id: Types.ObjectId
  tenantId: Types.ObjectId
  status: AccessReleaseStatus
  session: ClientSession
}

export interface IFindAllAccessReleaseByPersonTypeId {
  personTypeId: Types.ObjectId
  tenantId: Types.ObjectId
}

export interface IFindAllAccessReleaseByResponsibleId {
  responsibleId: Types.ObjectId
  tenantId: Types.ObjectId
}

export interface IFindLastAccessReleaseByPersonId {
  personId: Types.ObjectId
  tenantId: Types.ObjectId
}

export interface IFindAccessReleaseByAccessReleaseInvitationId {
  accessReleaseInvitationId: Types.ObjectId
  tenantId: Types.ObjectId
}

export interface IProcessAreaAccessPointsProps {
  accessPoints: Array<Partial<IAccessPoint>>
  person: PersonModel
  tenantId: Types.ObjectId
  accessRelease: IAccessRelease
  endDate: Date
  session: ClientSession
}

export interface IProcessEquipments {
  equipmentsIds: Array<Types.ObjectId>
  accessPoint: Partial<IAccessPoint>
  person: PersonModel
  tenantId: Types.ObjectId
  accessRelease: IAccessRelease
  endDate: Date
  session: ClientSession
}

export interface IScheduleDisableProps {
  endDate: Date
  accessReleaseId: Types.ObjectId
  tenantId: Types.ObjectId
  status: AccessReleaseStatus
}

export interface ISyncPersonAccessWithEquipmentsProps {
  accessRelease: IAccessRelease
  personId: Types.ObjectId
  tenantId: Types.ObjectId
  session: ClientSession
}

export enum RemoveAccessesFromPersonType {
  all = 'all',
  generalEntries = 'generalEntries'
}

export interface IRemoveAccessesFromPersonProps {
  person: PersonModel
  accessReleaseId: Types.ObjectId
  tenantId: Types.ObjectId
  type: RemoveAccessesFromPersonType
  session: ClientSession
}

export interface ICreateAccessReleaseByAccessReleaseInvitationIdProps {
  accessReleaseInvitationId: Types.ObjectId
  tenantId: Types.ObjectId
  guestId: Types.ObjectId
  personTypeId: Types.ObjectId
  picture: string
  session: ClientSession
}

export enum AccessReleaseType {
  default = 'default',
  invite = 'invite'
}

export const AccessReleaseTypeValues = Object.values(AccessReleaseType)

export enum AccessReleaseStatus {
  active = 'active',
  disabled = 'disabled',
  expired = 'expired',
  scheduled = 'scheduled',
  conflict = 'conflict'
}

export interface IAccessReleaseSynchronization {
  error?: boolean
  errorMessage?: string

  equipment: IEquipment
  accessPoint: Partial<IAccessPoint>
  syncType: 'add' | 'remove'
  date: Date
}

export interface IAccessRelease extends IModel {
  responsibleId?: Types.ObjectId
  observation?: string
  picture?: string
  type?: AccessReleaseType
  expiringTime?: ExpiringTime
  singleAccess?: boolean
  personTypeCategoryId?: Types.ObjectId
  status?: AccessReleaseStatus
  initDate?: Date
  endDate?: Date
  synchronizations?: Array<IAccessReleaseSynchronization>
  accessPointId?: Types.ObjectId
  noticeId?: Types.ObjectId
  workSchedulesCodes?: Array<number>
  accessReleaseInvitationId?: Types.ObjectId
  areasIds?: Array<Types.ObjectId>

  person?: IPerson
  personType?: IPersonType
  personTypeCategory?: IPersonTypeCategory
  responsible?: IPerson
  accessPoint?: IAccessPoint

  personId: Types.ObjectId
  personTypeId: Types.ObjectId
  finalAreasIds: Array<Types.ObjectId>
}

export class AccessReleaseModel extends Model<IAccessRelease> {
  private _responsibleId?: IAccessRelease['responsibleId']
  private _observation?: IAccessRelease['observation']
  private _picture?: IAccessRelease['picture']
  private _type?: IAccessRelease['type']
  private _expiringTime?: IAccessRelease['expiringTime']
  private _singleAccess?: IAccessRelease['singleAccess']
  private _personTypeCategoryId?: IAccessRelease['personTypeCategoryId']
  private _status?: IAccessRelease['status']
  private _initDate?: IAccessRelease['initDate']
  private _endDate?: IAccessRelease['endDate']
  private _synchronizations?: IAccessRelease['synchronizations']
  private _accessPointId?: IAccessRelease['accessPointId']
  private _noticeId?: IAccessRelease['noticeId']
  private _workSchedulesCodes?: IAccessRelease['workSchedulesCodes']
  private _accessReleaseInvitationId?: IAccessRelease['accessReleaseInvitationId']
  private _areasIds?: IAccessRelease['areasIds']

  private _person?: IAccessRelease['person']
  private _responsible?: IAccessRelease['responsible']
  private _personType?: IAccessRelease['personType']
  private _personTypeCategory?: IAccessRelease['personTypeCategory']
  private _accessPoint?: IAccessRelease['accessPoint']

  private _personId: IAccessRelease['personId']
  private _personTypeId: IAccessRelease['personTypeId']
  private _finalAreasIds: IAccessRelease['finalAreasIds']

  constructor (accessRelease: IAccessRelease) {
    super(accessRelease)

    this._responsibleId = accessRelease.responsibleId ? ObjectId(accessRelease.responsibleId) : undefined
    this._observation = accessRelease.observation
    this._picture = accessRelease.picture
    this._expiringTime = accessRelease.expiringTime
    this._singleAccess = accessRelease.singleAccess
    this._personTypeCategoryId = accessRelease.personTypeCategoryId ? ObjectId(accessRelease.personTypeCategoryId) : undefined
    this._endDate = accessRelease.endDate ??
      (this._expiringTime ? addExpiringTime(this._expiringTime, (accessRelease.initDate ?? DateUtils.getCurrent())) : accessRelease.endDate)
    this._initDate = accessRelease.initDate ?? DateUtils.getCurrent()
    this._status = accessRelease.status ?? (this._initDate <= DateUtils.getCurrent() ? AccessReleaseStatus.active : AccessReleaseStatus.scheduled)
    this._observation = accessRelease.observation
    this._synchronizations = accessRelease.synchronizations ?? []
    this._accessPointId = accessRelease.accessPointId ? ObjectId(accessRelease.accessPointId) : undefined
    this._noticeId = accessRelease.noticeId ? ObjectId(accessRelease.noticeId) : undefined
    this._workSchedulesCodes = accessRelease.workSchedulesCodes ?? []
    this._accessReleaseInvitationId = accessRelease.accessReleaseInvitationId ? ObjectId(accessRelease.accessReleaseInvitationId) : undefined
    this._areasIds = accessRelease.areasIds?.map(areaId => ObjectId(areaId)) ?? []

    this._person = accessRelease.person
    this._responsible = accessRelease.responsible
    this._personType = accessRelease.personType
    this._personTypeCategory = accessRelease.personTypeCategory
    this._accessPoint = accessRelease.accessPoint

    this._type = accessRelease.type
    this._personId = ObjectId(accessRelease.personId)
    this._personTypeId = ObjectId(accessRelease.personTypeId)
    this._finalAreasIds = accessRelease.finalAreasIds.map(finalAreaId => ObjectId(finalAreaId))
    this.actions = accessRelease.actions || [{
      action: ModelAction.create,
      date: DateUtils.getCurrent()
    }]
  }

  get workSchedulesCodes (): IAccessRelease['workSchedulesCodes'] {
    return this._workSchedulesCodes
  }

  set workSchedulesCodes (workSchedulesCodes: IAccessRelease['workSchedulesCodes']) {
    this._workSchedulesCodes = workSchedulesCodes
  }

  get status (): IAccessRelease['status'] {
    return this._status
  }

  get singleAccess (): IAccessRelease['singleAccess'] {
    return this._singleAccess
  }

  get expiringTime (): IAccessRelease['expiringTime'] {
    return this._expiringTime
  }

  get endDate (): IAccessRelease['endDate'] {
    return this._endDate
  }

  set endDate (endDate: IAccessRelease['endDate']) {
    this._endDate = endDate
  }

  get personId (): IAccessRelease['personId'] {
    return this._personId
  }

  get initDate (): IAccessRelease['initDate'] {
    return this._initDate
  }

  get accessPointId (): IAccessRelease['accessPointId'] {
    return this._accessPointId
  }

  get areasIds (): IAccessRelease['areasIds'] {
    return this._areasIds
  }

  get person (): IAccessRelease['person'] {
    return this._person
  }

  get personType (): IAccessRelease['personType'] {
    return this._personType
  }

  get personTypeCategory (): IAccessRelease['personTypeCategory'] {
    return this._personTypeCategory
  }

  get accessPoint (): IAccessRelease['accessPoint'] {
    return this._accessPoint
  }

  get responsible (): IAccessRelease['responsible'] {
    return this._responsible
  }

  get object (): IAccessRelease {
    return {
      _id: this._id,
      tenantId: this.tenantId,
      actions: this.actions,
      active: this.active,
      createdAt: this.createdAt,
      deletionDate: this.deletionDate,
      responsibleId: this._responsibleId,
      observation: this._observation,
      areasIds: this._areasIds,
      accessPointId: this._accessPointId,
      picture: this._picture,
      expiringTime: this._expiringTime,
      singleAccess: this._singleAccess,
      personTypeCategoryId: this._personTypeCategoryId,
      status: this._status,
      initDate: this._initDate,
      endDate: this._endDate,
      noticeId: this._noticeId,
      workSchedulesCodes: this._workSchedulesCodes,
      synchronizations: this._synchronizations,
      accessReleaseInvitationId: this._accessReleaseInvitationId,

      type: this._type,
      personId: this._personId,
      personTypeId: this._personTypeId,
      finalAreasIds: this._finalAreasIds
    }
  }

  get show () {
    return {
      ...this.object,
      person: this._person,
      personType: this._personType,
      personTypeCategory: this._personTypeCategory,
      responsible: this._responsible,
      accessPoint: this._accessPoint
    }
  }

  static listFilters (
    {
      search,
      limit,
      page,
      tenantId,
      personTypeId,
      personId,
      accessPointId,
      noticeId,
      personTypeCategoryId,
      responsibleId,
      status,
      initDate,
      endDate
    }: Partial<IListAccessReleasesFilters>
  ): IListAccessReleasesFilters {
    const filters = {
      deletionDate: undefined
    } as IListAccessReleasesFilters

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

    if (status) Object.assign(filters, { status })
    if (accessPointId) Object.assign(filters, { accessPointId: ObjectId(accessPointId) })
    if (noticeId) Object.assign(filters, { noticeId: ObjectId(noticeId) })
    if (personTypeCategoryId) Object.assign(filters, { personTypeCategoryId: ObjectId(personTypeCategoryId) })
    if (responsibleId) Object.assign(filters, { responsibleId: ObjectId(responsibleId) })
    if (personId) Object.assign(filters, { personId: ObjectId(personId) })
    if (personTypeId) Object.assign(filters, { personTypeId: ObjectId(personTypeId) })
    if (tenantId) Object.assign(filters, { tenantId: ObjectId(tenantId) })
    if (search) {
      Object.assign(filters, {
        $or: [
          { 'person.name': { $regex: search, $options: 'i' } },
          { 'person.cpf': { $regex: search, $options: 'i' } },
          { 'person.cnpj': { $regex: search, $options: 'i' } },
          { 'person.register': { $regex: search, $options: 'i' } },
          { 'person.passport': { $regex: search, $options: 'i' } },
          { 'person.email': { $regex: search, $options: 'i' } },
          { 'person.phone': { $regex: search, $options: 'i' } },
          { 'person.rg': { $regex: search, $options: 'i' } },
          { 'person.role': { $regex: search, $options: 'i' } }
        ]
      })
    }
    if (limit) Object.assign(filters, { limit: Number(limit) })
    if (page) Object.assign(filters, { page: Number(page) })

    return filters
  }
}
