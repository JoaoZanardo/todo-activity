import to from 'await-to-js'
import { fork } from 'child_process'
import { ClientSession } from 'mongoose'
import path from 'path'

import { IFindModelByIdProps } from '../../core/interfaces/Model'
import { IAggregatePaginate } from '../../core/interfaces/Repository'
import { IAccessRelease } from '../../models/AccessRelease/AccessReleaseModel'
import { AccessSynchronizationModel, IAccessSynchronization, IListAccessSynchronizationsFilters, ISynchronizeProps } from '../../models/AccessSynchronization/AccessSynchronizationModel'
import { AccessSynchronizationRepositoryImp } from '../../models/AccessSynchronization/AccessSynchronizationMongoDB'
import EquipmentServer from '../../services/EquipmentServer'
import CustomResponse from '../../utils/CustomResponse'
import { DateUtils } from '../../utils/Date'
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
        const accessReleases = await AccessReleaseServiceImp.findAllByPersonTypeId({
          personTypeId,
          tenantId
        })

        accessReleases.push(...accessReleases)
      })
    )

    if (accessReleases.length) {
      await this.accessSynchronizationRepositoryImp.update({
        id: createdAccessSynchronization._id!,
        tenantId,
        data: {
          totalDocs: accessReleases.length
        },
        session
      })

      const worker = fork(path.resolve(__dirname, './syncWorker.js'))

      worker.send({
        accessReleases,
        accessSynchronizationId: createdAccessSynchronization._id,
        equipment,
        tenantId
      })
    }

    return createdAccessSynchronization
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
            personCode: person._id!,
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
              equipmentId: equipment._id!,
              equipmentIp: equipment.ip,
              message: error.message
            }
          })
        }
      })
    )
  }
}
