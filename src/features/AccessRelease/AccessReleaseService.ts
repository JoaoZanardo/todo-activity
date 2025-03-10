import to from 'await-to-js'
import { Types } from 'mongoose'
import schedule from 'node-schedule'

import database from '../../config/database'
import { IFindModelByIdProps, ModelAction } from '../../core/interfaces/Model'
import { IAggregatePaginate } from '../../core/interfaces/Repository'
import { AccessReleaseModel, AccessReleaseStatus, IAccessRelease, IAccessReleaseSynchronization, IDisableAccessReleaseProps, IFindAccessReleaseByAccessReleaseInvitationId, IFindAllAccessReleaseByPersonTypeId, IFindAllAccessReleaseByResponsibleId, IFindAllAccessReleasesByWorkScheduleCodeProps, IFindLastAccessReleaseByPersonId, IListAccessReleasesFilters, IProcessAreaAccessPointsProps, IProcessEquipments, IRemoveAccessesFromPersonProps, IScheduleDisableProps, ISyncPersonAccessWithEquipmentsProps, RemoveAccessesFromPersonType } from '../../models/AccessRelease/AccessReleaseModel'
import { AccessReleaseRepositoryImp } from '../../models/AccessRelease/AccessReleaseMongoDB'
import EquipmentServer from '../../services/EquipmentServer'
import CustomResponse from '../../utils/CustomResponse'
import { DateUtils } from '../../utils/Date'
import { getErrorMessage } from '../../utils/getErrorMessage'
import { AccessPointServiceImp } from '../AccessPoint/AccessPointController'
import { AccessReleaseServiceImp } from '../AccessRelease/AccessReleaseController'
import { AreaServiceImp } from '../Area/AreaController'
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

  async findAllByWorkScheduleCode ({
    workScheduleCode,
    tenantId
  }: IFindAllAccessReleasesByWorkScheduleCodeProps): Promise<Array<Partial<IAccessRelease>>> {
    return await this.accessReleaseRepositoryImp.findAllByWorkScheduleCode({
      workScheduleCode,
      tenantId
    })
  }

  async findById ({
    id,
    tenantId
  }: IFindModelByIdProps): Promise<AccessReleaseModel> {
    const accessRelease = await this.accessReleaseRepositoryImp.findById({
      id,
      tenantId
    })
    if (!accessRelease) throw CustomResponse.NOT_FOUND('Liberação de acesso não cadastrada!')

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

  async findByAccessReleaseInvitationId ({
    accessReleaseInvitationId,
    tenantId
  }: IFindAccessReleaseByAccessReleaseInvitationId): Promise<AccessReleaseModel | null > {
    return await this.accessReleaseRepositoryImp.findByAccessReleaseInvitationId({
      accessReleaseInvitationId,
      tenantId
    })
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

  async findAllByResponsibleId ({
    responsibleId,
    tenantId
  }: IFindAllAccessReleaseByResponsibleId): Promise<Array<Partial<IAccessRelease>>> {
    return await this.accessReleaseRepositoryImp.findAllByResponsibleId({
      responsibleId,
      tenantId
    })
  }

  async disable ({
    id,
    tenantId,
    responsibleId,
    status,
    session,
    type = RemoveAccessesFromPersonType.all
  }: IDisableAccessReleaseProps): Promise<void> {
    const accessRelease = await this.findById({
      id,
      tenantId
    })

    const person = await PersonServiceImp.findById({
      id: accessRelease.object.personId,
      tenantId
    })

    await this.removeAccessesFromPerson({
      accessReleaseId: accessRelease._id!,
      person,
      tenantId,
      type,
      session
    })

    let updateData: Partial<IAccessRelease> = {
      actions: [
        ...accessRelease.actions!,
        {
          action: ModelAction.update,
          date: DateUtils.getCurrent(),
          userId: responsibleId
        }
      ]
    }

    if (type === RemoveAccessesFromPersonType.all) {
      updateData = {
        ...updateData,
        active: false,
        status,
        endDate: DateUtils.getCurrent()
      }
    }

    const updated = await this.accessReleaseRepositoryImp.update({
      id,
      tenantId,
      data: updateData,
      session
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
      const session = await database.startSession()
      session.startTransaction()

      try {
        const accessRelease = await this.findById({
          id: accessReleaseId,
          tenantId
        })

        if (accessRelease.status !== AccessReleaseStatus.active) throw CustomResponse.CONFLICT('Liberação de acesso não ativa!')

        await AccessReleaseServiceImp.disable({
          id: accessReleaseId,
          tenantId,
          status,
          session
        })

        await session.commitTransaction()
        session.endSession()
      } catch (error) {
        session.endSession()

        console.error('Erro ao remover acessos do equipamentos:', error)
      }
    })
  }

  async syncPersonAccessWithEquipments ({
    accessRelease,
    personId,
    tenantId,
    session
  }: ISyncPersonAccessWithEquipmentsProps) {
    const person = await PersonServiceImp.findById({
      id: personId,
      tenantId
    })

    const finalAreaId = accessRelease.finalAreasIds[0]

    const areasIds = accessRelease.areasIds?.length ? accessRelease.areasIds : await this.getAllAreasIdsByFinalAreaId(finalAreaId, tenantId)

    await Promise.all(
      areasIds.map(async areaId => {
        const accessPoints = await AccessPointServiceImp.findAllByAreaId({ areaId, tenantId })

        if (accessPoints.length) {
          await this.processAreaAccessPoints({
            accessPoints,
            endDate: accessRelease.endDate!,
            person,
            tenantId,
            accessRelease,
            session
          })
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
      },
      session
    })
  }

  private async removeAccessesFromPerson ({
    accessReleaseId,
    person,
    tenantId,
    type,
    session
  }: IRemoveAccessesFromPersonProps) {
    const accessPoints = type === RemoveAccessesFromPersonType.all
      ? await AccessPointServiceImp.findAllByPersonTypeId({
        personTypeId: person.personTypeId,
        tenantId
      }) : await AccessPointServiceImp.findAllGeneralEntry(tenantId)

    if (accessPoints.length) {
      await Promise.all(
        accessPoints.map(async accessPoint => {
          if (accessPoint.equipmentsIds?.length) {
            await Promise.all(
              accessPoint.equipmentsIds.map(async equipmentId => {
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
                  synchronization,
                  session
                })
              })
            )
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
    accessRelease,
    session
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
            accessRelease,
            accessPoint,
            session
          })
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
    accessPoint,
    session
  }: IProcessEquipments) {
    await Promise.all(
      equipmentsIds.map(async (equipmentId) => {
        const equipment = await EquipmentServiceImp.findById({ id: equipmentId, tenantId })

        const workSchedulesCodes = accessRelease.workSchedulesCodes

        const schedules = workSchedulesCodes?.length
          ? workSchedulesCodes.map(scheduleCode => {
            return {
              scheduleCode,
              description: `ScheduleCode-${scheduleCode}`
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
          synchronization,
          session
        })
      })
    )
  }

  private async getAllAreasIdsByFinalAreaId (finalAreaId: Types.ObjectId, tenantId: Types.ObjectId): Promise<Array<Types.ObjectId>> {
    const areasIds: Array<Types.ObjectId> = [finalAreaId]

    let currentArea = await AreaServiceImp.findById({
      id: finalAreaId,
      tenantId
    })

    while (currentArea?.areaId) {
      areasIds.push(currentArea.areaId)

      currentArea = await AreaServiceImp.findById({
        id: currentArea.areaId,
        tenantId
      })
    }

    return areasIds.reverse()
  }
}
