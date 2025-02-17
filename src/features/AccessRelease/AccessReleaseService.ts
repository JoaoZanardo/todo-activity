import to from 'await-to-js'
import schedule from 'node-schedule'

import { IFindModelByIdProps, ModelAction } from '../../core/interfaces/Model'
import { IAggregatePaginate } from '../../core/interfaces/Repository'
import { AccessReleaseModel, AccessReleaseStatus, IAccessRelease, IAccessReleaseSynchronization, IDisableAccessReleaseProps, IFindAllAccessReleaseByPersonTypeId, IFindLastAccessReleaseByPersonId, IListAccessReleasesFilters, IProcessAreaAccessPointsProps, IProcessEquipments, IRemoveAllAccessFromPersonProps, IScheduleDisableProps, ISyncPersonAccessWithEquipmentsProps } from '../../models/AccessRelease/AccessReleaseModel'
import { AccessReleaseRepositoryImp } from '../../models/AccessRelease/AccessReleaseMongoDB'
import EquipmentServer from '../../services/EquipmentServer'
import CustomResponse from '../../utils/CustomResponse'
import { DateUtils } from '../../utils/Date'
import { getErrorMessage } from '../../utils/getErrorMessage'
import { AccessPointServiceImp } from '../AccessPoint/AccessPointController'
import { AccessReleaseServiceImp } from '../AccessRelease/AccessReleaseController'
import { EquipmentServiceImp } from '../Equipment/EquipmentController'
import { PersonServiceImp } from '../Person/PersonController'
import { PersonTypeServiceImp } from '../PersonType/PersonTypeController'

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

    await this.removeAllAccessFromPerson({
      accessReleaseId: accessRelease._id!,
      person,
      tenantId
    })

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

  async syncPersonAccessWithEquipments ({
    accessRelease,
    personId,
    tenantId
  }: ISyncPersonAccessWithEquipmentsProps) {
    const person = await PersonServiceImp.findById({
      id: personId,
      tenantId
    })

    await Promise.all(
      accessRelease.areasIds.map(async areaId => {
        try {
          const accessPoints = await AccessPointServiceImp.findAllByAreaId({ areaId, tenantId })

          if (accessPoints.length) {
            await this.processAreaAccessPoints({
              accessPoints,
              endDate: accessRelease.endDate!,
              person,
              tenantId,
              accessRelease
            })
          }
        } catch (error) {
          console.log(`SyncPersonAccessWithEquipments - MAP: ${error}`)
        }
      })
    )

    await AccessReleaseRepositoryImp.update({
      id: accessRelease._id!,
      tenantId,
      data: {
        status: AccessReleaseStatus.active,
        actions: [
          ...accessRelease.actions!,
          {
            action: ModelAction.update,
            date: DateUtils.getCurrent()
          }
        ]
      }
    })
  }

  private async removeAllAccessFromPerson ({
    accessReleaseId,
    person,
    tenantId
  }: IRemoveAllAccessFromPersonProps) {
    const accessPoints = await AccessPointServiceImp.findAllByPersonTypeId({
      personTypeId: person.personTypeId,
      tenantId
    })

    if (accessPoints.length) {
      await Promise.all(
        accessPoints.map(async accessPoint => {
          try {
            if (accessPoint.equipmentsIds?.length) {
              await Promise.all(
                accessPoint.equipmentsIds.map(async equipmentId => {
                  try {
                    const equipment = await EquipmentServiceImp.findById({
                      id: equipmentId,
                      tenantId
                    })

                    // try to delete  all access, if one throw errors, do not cancel all the session
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
                    const [error, _] = await to(
                      EquipmentServer.removeAccess({
                        equipmentIp: equipment.ip,
                        personId: person._id!
                      })
                    )

                    const synchronization: IAccessReleaseSynchronization = {
                      accessPoint,
                      equipment: equipment.show,
                      syncType: 'remove',
                      date: DateUtils.getCurrent()
                    }

                    if (error) {
                      synchronization.error = true
                      synchronization.errorMessage = getErrorMessage(error)
                    }

                    await this.accessReleaseRepositoryImp.updateSynchronizations({
                      id: accessReleaseId,
                      tenantId,
                      synchronization
                    })
                  } catch (error) {
                    console.log(`EquipmentRemoveAccess - MAP: ${error}`)
                  }
                })
              )
            }
          } catch (error) {
            console.log(`RemoveAllAccessFromPerson - MAP: ${error}`)
          }
        })
      )
    }
  }

  private async processAreaAccessPoints ({
    accessPoints,
    endDate,
    person,
    tenantId,
    accessRelease
  }: IProcessAreaAccessPointsProps) {
    const personTypeId = person.personTypeId

    await Promise.all(
      accessPoints.map(async (accessPoint) => {
        try {
          const { personTypesIds, equipmentsIds } = accessPoint

          const isPersonTypeIncluded = personTypesIds?.some(id => id.equals(personTypeId))

          if (isPersonTypeIncluded && equipmentsIds?.length) {
            await this.processEquipments({
              endDate,
              equipmentsIds,
              person,
              tenantId,
              accessRelease,
              accessPoint
            })
          }
        } catch (error) {
          console.log(`ProcessAreaAccessPoints - MAP: ${error}`)
        }
      })
    )
  }

  private async processEquipments ({
    endDate,
    equipmentsIds,
    person,
    tenantId,
    accessRelease,
    accessPoint
  }: IProcessEquipments) {
    await Promise.all(
      equipmentsIds.map(async (equipmentId) => {
        try {
          const equipment = await EquipmentServiceImp.findById({ id: equipmentId, tenantId })

          const personTypeId = person.personTypeId

          const personType = await PersonTypeServiceImp.findById({
            id: personTypeId,
            tenantId
          })

          const workSchedulesIds = personType.object.workSchedulesIds

          const schedules = workSchedulesIds?.length
            ? workSchedulesIds.map(workScheduleId => {
              return {
                scheduleId: workScheduleId,
                description: `workScheduleId-${workScheduleId}`
              }
            })
            : []

          // try to create all access, if one throw errors, do not cancel all the session
          // eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
          const [error, _] = await to(
            EquipmentServer.addAccess({
              equipmentIp: equipment.ip,
              personCode: person.code!,
              personId: person._id!,
              personName: person.name,
              personPictureUrl: person.object.picture!,
              initDate: DateUtils.getCurrent(),
              endDate,
              schedules
            })
          )

          const synchronization: IAccessReleaseSynchronization = {
            accessPoint,
            equipment: equipment.show,
            syncType: 'add',
            date: DateUtils.getCurrent()
          }

          if (error) {
            synchronization.error = true
            synchronization.errorMessage = getErrorMessage(error)
          }

          await this.accessReleaseRepositoryImp.updateSynchronizations({
            id: accessRelease._id!,
            tenantId,
            synchronization
          })
        } catch (error) {
          console.log(`ProcessEquipments - MAP: ${error}`)
        }
      })
    )
  }
}
