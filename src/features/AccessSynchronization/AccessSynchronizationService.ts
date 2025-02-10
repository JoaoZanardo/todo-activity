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
import { getPersonCodeByPersonId } from '../../utils/getPersonCodeByPersonId'
import { AccessReleaseServiceImp } from '../AccessRelease/AccessReleaseController'
import { EquipmentServiceImp } from '../Equipment/EquipmentController'

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

      if (process.send) {
        process.send({ status: 'completed' })
      }
    } catch (error: any) {
      if (process.send) {
        process.send({
          status: 'error',
          error: error?.message
        })
      }
    }
  }

  async synchronize ({
    accessReleases,
    accessSynchronizationId,
    equipment,
    tenantId
  }: ISynchronizeProps): Promise<void> {
    await Promise.all(
      accessReleases.map(async accessRelease => {
        const person = accessRelease.person!

        // eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
        const [error, _] = await to(
          EquipmentServer.addAccess({
            equipmentIp: equipment.ip,
            personCode: getPersonCodeByPersonId(person._id!),
            personId: person._id!,
            personName: person.name,
            personPictureUrl: person.picture!,
            initDate: DateUtils.getCurrent(),
            endDate: DateUtils.getDefaultEndDate(),
            schedules: []
          })
        )

        if (error) {
          await this.accessSynchronizationRepositoryImp.updateSynErrors({
            id: accessSynchronizationId!,
            tenantId,
            syncError: {
              person,
              message: (error as any).response.data.message
            }
          })
        }
      })
    )
  }
}
