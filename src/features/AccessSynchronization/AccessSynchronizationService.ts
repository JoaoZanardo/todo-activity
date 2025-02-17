import to from 'await-to-js'
import { ClientSession } from 'mongoose'

import { IFindModelByIdProps } from '../../core/interfaces/Model'
import { IAggregatePaginate } from '../../core/interfaces/Repository'
import { IAccessRelease } from '../../models/AccessRelease/AccessReleaseModel'
import { AccessSynchronizationModel, IAccessSynchronization, IListAccessSynchronizationsFilters, ISynchronizeProps } from '../../models/AccessSynchronization/AccessSynchronizationModel'
import { AccessSynchronizationRepositoryImp } from '../../models/AccessSynchronization/AccessSynchronizationMongoDB'
import EquipmentServer from '../../services/EquipmentServer'
import CustomResponse from '../../utils/CustomResponse'
import { DateUtils } from '../../utils/Date'
import { getErrorMessage } from '../../utils/getErrorMessage'
import { AccessReleaseServiceImp } from '../AccessRelease/AccessReleaseController'
import { EquipmentServiceImp } from '../Equipment/EquipmentController'
import { PersonTypeServiceImp } from '../PersonType/PersonTypeController'

export class AccessSynchronizationService {
  constructor (
    private accessSynchronizationRepositoryImp: typeof AccessSynchronizationRepositoryImp
  ) {
    this.accessSynchronizationRepositoryImp = accessSynchronizationRepositoryImp
  }

  async list (filters: IListAccessSynchronizationsFilters): Promise<IAggregatePaginate<IAccessSynchronization>> {
    return await this.accessSynchronizationRepositoryImp.list(filters)
  }

  async findById ({
    id,
    tenantId
  }: IFindModelByIdProps): Promise<AccessSynchronizationModel> {
    const accessSynchronization = await this.accessSynchronizationRepositoryImp.findById({
      id,
      tenantId
    })
    if (!accessSynchronization) throw CustomResponse.NOT_FOUND('Sincronização de acesso não cadastrada!')

    return accessSynchronization
  }

  async create (accessSynchronization: AccessSynchronizationModel, session: ClientSession): Promise<AccessSynchronizationModel> {
    const tenantId = accessSynchronization.tenantId

    const equipment = await EquipmentServiceImp.findById({
      id: accessSynchronization.object.equipmentId,
      tenantId
    })

    const createdAccessSynchronization = await this.accessSynchronizationRepositoryImp.create(accessSynchronization, session)

    const accessReleases: Array<Partial<IAccessRelease>> = []

    await Promise.all(
      accessSynchronization.personTypesIds.map(async personTypeId => {
        const accessReleasesDocs = await AccessReleaseServiceImp.findAllByPersonTypeId({
          personTypeId,
          tenantId
        })

        accessReleases.push(...accessReleasesDocs)

        return accessReleasesDocs
      })
    )

    if (!accessReleases.length) throw CustomResponse.BAD_REQUEST('Não há registros de acesso para sincronizar!')

    await this.accessSynchronizationRepositoryImp.update({
      id: createdAccessSynchronization._id!,
      tenantId,
      data: {
        totalDocs: accessReleases.length
      },
      session
    })

    this.synchronizeAll({
      accessReleases,
      accessSynchronizationId: createdAccessSynchronization._id!,
      equipment: {
        ip: equipment.ip,
        id: equipment._id!
      },
      tenantId
    })

    return createdAccessSynchronization
  }

  async synchronizeAll ({
    accessReleases,
    accessSynchronizationId,
    equipment,
    tenantId
  }: ISynchronizeProps): Promise<void> {
    try {
      while (accessReleases.length) {
        const batch = accessReleases.splice(0, 25)

        await this.synchronize({
          accessReleases: batch,
          accessSynchronizationId,
          equipment,
          tenantId
        })

        await AccessSynchronizationRepositoryImp.updateExecutedNumbers({
          id: accessSynchronizationId,
          tenantId,
          number: batch.length
        })
      }

      await AccessSynchronizationRepositoryImp.update({
        id: accessSynchronizationId!,
        tenantId,
        data: {
          endDate: DateUtils.getCurrent(),
          finished: true
        }
      })
    } catch (error: any) {
      console.log(`Syncronize All: ${error}`)
    }
  }

  async synchronize ({
    accessReleases,
    accessSynchronizationId,
    equipment,
    tenantId
  }: ISynchronizeProps): Promise<void> {
    try {
      await Promise.all(
        accessReleases.map(async (accessRelease) => {
          try {
            const person = accessRelease.person!

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

            // eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
            const [error, _] = await to(
              EquipmentServer.addAccess({
                equipmentIp: equipment.ip,
                personCode: person.code!,
                personId: person._id!,
                personName: person.name,
                personPictureUrl: person.picture!,
                initDate: accessRelease.initDate,
                endDate: accessRelease.endDate,
                schedules
              })
            )

            if (error) {
              await this.accessSynchronizationRepositoryImp.updateSynErrors({
                id: accessSynchronizationId!,
                tenantId,
                syncError: {
                  person,
                  message: getErrorMessage(error)
                }
              })
            }
          } catch (err) {
            console.error(`Erro ao processar accessRelease: ${err}`)
          }
        })
      )
    } catch (err) {
      console.error(`Erro geral na sincronização: ${err}`)
    }
  }
}
