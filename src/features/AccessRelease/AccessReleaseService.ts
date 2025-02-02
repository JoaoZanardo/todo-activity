import to from 'await-to-js'
import schedule from 'node-schedule'

import { IFindModelByIdProps, ModelAction } from '../../core/interfaces/Model'
import { IAggregatePaginate } from '../../core/interfaces/Repository'
import { AccessReleaseModel, AccessReleaseStatus, IAccessRelease, IDisableAccessReleaseProps, IFindAllAccessReleaseByPersonTypeId, IFindLastAccessReleaseByPersonId, IListAccessReleasesFilters, IProcessAreaAccessPointsProps, IProcessEquipments, IScheduleDisableProps } from '../../models/AccessRelease/AccessReleaseModel'
import { AccessReleaseRepositoryImp } from '../../models/AccessRelease/AccessReleaseMongoDB'
import EquipmentServer from '../../services/EquipmentServer'
import CustomResponse from '../../utils/CustomResponse'
import { DateUtils } from '../../utils/Date'
import { getPersonCodeByPersonId } from '../../utils/getPersonCodeByPersonId'
import { AccessControlServiceImp } from '../AccessControl/AccessControlController'
import { AccessPointServiceImp } from '../AccessPoint/AccessPointController'
import { AccessReleaseServiceImp } from '../AccessRelease/AccessReleaseController'
import { EquipmentServiceImp } from '../Equipment/EquipmentController'
import { PersonServiceImp } from '../Person/PersonController'

export class AccessReleaseService {
  constructor (
    private accessReleaseRepositoryImp: typeof AccessReleaseRepositoryImp
  ) {
    this.accessReleaseRepositoryImp = accessReleaseRepositoryImp
  }

  async list (filters: IListAccessReleasesFilters): Promise<IAggregatePaginate<IAccessRelease>> {
    return await this.accessReleaseRepositoryImp.list(filters)
  }

  async findById ({
    id,
    tenantId
  }: IFindModelByIdProps): Promise<AccessReleaseModel> {
    const accessRelease = await this.accessReleaseRepositoryImp.findById({
      id,
      tenantId
    })
    if (!accessRelease) throw CustomResponse.NOT_FOUND('Liberação de acesso não cadastrado!')

    return accessRelease
  }

  async findLastByPersonId ({
    personId,
    tenantId
  }: IFindLastAccessReleaseByPersonId): Promise<AccessReleaseModel | null> {
    const accessRelease = await this.accessReleaseRepositoryImp.findLastByPersonId({
      personId,
      tenantId
    })

    return accessRelease
  }

  async findAllExpiringToday (): Promise<Array<Partial<IAccessRelease>>> {
    return await this.accessReleaseRepositoryImp.findAllExpiringToday()
  }

  async findAllStartingToday (): Promise<Array<Partial<IAccessRelease>>> {
    return await this.accessReleaseRepositoryImp.findAllStartingToday()
  }

  async findAllByPersonTypeId ({
    personTypeId,
    tenantId
  }: IFindAllAccessReleaseByPersonTypeId): Promise<Array<Partial<IAccessRelease>>> {
    return await this.accessReleaseRepositoryImp.findAllByPersonTypeId({
      personTypeId,
      tenantId
    })
  }

  async create (accessRelease: AccessReleaseModel): Promise<AccessReleaseModel> {
    const { tenantId, personId, areasIds } = accessRelease

    const lastAccessRelease = await AccessReleaseServiceImp.findLastByPersonId({
      personId,
      tenantId
    })

    if (
      lastAccessRelease &&
      lastAccessRelease.status === AccessReleaseStatus.active
    ) throw CustomResponse.CONFLICT('Essa pessoa já possui uma liberação de acesso!')

    const person = await PersonServiceImp.findById({ id: personId, tenantId })

    // const accessPoint = await AccessPointServiceImp.findById({ id: accessPointId, tenantId })

    if (!accessRelease.expiringTime) {
      accessRelease.endDate = DateUtils.getDefaultEndDate()
    }

    const { initDate, endDate } = accessRelease.object

    if (endDate! < initDate!) throw CustomResponse.UNPROCESSABLE_ENTITY('A data de término deve ser maior que a data de início!')

    const createdAccessRelease = await this.accessReleaseRepositoryImp.create(accessRelease)

    if (DateUtils.isToday(createdAccessRelease.endDate!)) {
      this.scheduleDisable({
        endDate: createdAccessRelease.endDate!,
        accessReleaseId: createdAccessRelease._id!,
        tenantId,
        status: AccessReleaseStatus.expired
      })
    }

    if (DateUtils.isToday(createdAccessRelease.object.initDate!)) {
      await Promise.all(
        areasIds.map(async areaId => {
          const accessPoints = await AccessPointServiceImp.findAllByAreaId({ areaId, tenantId })

          if (accessPoints.length) {
            await this.processAreaAccessPoints({
              accessPoints,
              endDate: accessRelease.endDate!,
              person,
              tenantId,
              accessRelease: createdAccessRelease.object
            })
          }
        })
      )
    }

    return createdAccessRelease
  }

  async disable ({
    id,
    tenantId,
    responsibleId,
    status
  }: IDisableAccessReleaseProps): Promise<void> {
    const accessRelease = await this.findById({
      id,
      tenantId
    })

    const person = await PersonServiceImp.findById({
      id: accessRelease.object.personId,
      tenantId
    })

    await AccessControlServiceImp.removeAllAccessFromPerson(person, tenantId)

    const updated = await this.accessReleaseRepositoryImp.update({
      id,
      tenantId,
      data: {
        active: false,
        status,
        endDate: DateUtils.getCurrent(),
        actions: [
          ...accessRelease.actions!,
          {
            action: ModelAction.update,
            date: DateUtils.getCurrent(),
            userId: responsibleId
          }
        ]
      }
    })

    if (!updated) {
      throw CustomResponse.INTERNAL_SERVER_ERROR('Ocorreu um erro ao tentar desativar liberação de acesso!', {
        accessReleaseId: id
      })
    }
  }

  async scheduleDisable ({
    endDate,
    accessReleaseId,
    tenantId,
    status
  }: IScheduleDisableProps): Promise<void> {
    const adjustedExecutionDate = new Date(endDate)
    adjustedExecutionDate.setHours(endDate.getHours() + 3)

    schedule.scheduleJob(adjustedExecutionDate, async () => {
      await AccessReleaseServiceImp.disable({
        id: accessReleaseId,
        tenantId,
        status
      })
    })
  }

  async processAreaAccessPoints ({
    accessPoints,
    endDate,
    person,
    tenantId,
    accessRelease
  }: IProcessAreaAccessPointsProps) {
    const personTypeId = person.personTypeId

    await Promise.all(
      accessPoints.map(async (accessPoint) => {
        const { personTypesIds, equipmentsIds } = accessPoint

        const isPersonTypeIncluded = personTypesIds?.some(id => id.equals(personTypeId))

        if (isPersonTypeIncluded && equipmentsIds?.length) {
          await this.processEquipments({
            endDate,
            equipmentsIds,
            person,
            tenantId,
            accessRelease
          })
        }
      })
    )
  }

  async updateEndDateToCurrent ({
    id,
    tenantId
  }: IFindModelByIdProps): Promise<void> {
    await this.accessReleaseRepositoryImp.update({
      id,
      tenantId,
      data: {
        endDate: DateUtils.getCurrent()
      }
    })
  }

  private async processEquipments ({
    endDate,
    equipmentsIds,
    person,
    tenantId,
    accessRelease
  }: IProcessEquipments) {
    await Promise.all(
      equipmentsIds.map(async (equipmentId) => {
        const equipment = await EquipmentServiceImp.findById({ id: equipmentId, tenantId })
        console.log({ equipment: equipment.show })

        // try to create all access, if one throw errors, do not cancel all the session
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
        const [error, _] = await to(
          EquipmentServer.addAccess({
            equipmentIp: equipment.ip,
            personCode: getPersonCodeByPersonId(person._id!),
            personId: person._id!,
            personName: person.name,
            personPictureUrl: person.object.picture!,
            initDate: DateUtils.getCurrent(),
            endDate,
            schedules: []
          })
        )

        let errorMessage

        if (error) {
          errorMessage = error.message

          console.log({ errorMessage })
        }

        await this.accessReleaseRepositoryImp.updateSynchronizations({
          id: accessRelease._id!,
          tenantId,
          synchronization: {
            equipmentId,
            equipmentIp: equipment.ip,
            error: !!errorMessage,
            errorMessage
          }
        })
      })
    )
  }
}
