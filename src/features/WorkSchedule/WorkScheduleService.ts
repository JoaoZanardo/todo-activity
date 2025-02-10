import { EquipmentServiceImp } from 'src/features/Equipment/EquipmentController'
import EquipmentServer from 'src/services/EquipmentServer'

import { IFindAllModelsProps, IFindModelByIdProps, IFindModelByNameProps, ModelAction } from '../../core/interfaces/Model'
import { IDeleteWorkScheduleProps, IListWorkSchedulesFilters, IUpdateWorkScheduleProps, IWorkSchedule, WorkScheduleModel } from '../../models/WorkSchedule/WorkScheduleModel'
import { WorkScheduleRepositoryImp } from '../../models/WorkSchedule/WorkScheduleMongoDB'
import CustomResponse from '../../utils/CustomResponse'
import { DateUtils } from '../../utils/Date'

export class WorkScheduleService {
  constructor (
    private workScheduleRepositoryImp: typeof WorkScheduleRepositoryImp
  ) {
    this.workScheduleRepositoryImp = workScheduleRepositoryImp
  }

  async findById ({
    id,
    tenantId
  }: IFindModelByIdProps): Promise<WorkScheduleModel> {
    const workSchedule = await this.workScheduleRepositoryImp.findById({
      id,
      tenantId
    })

    if (!workSchedule) throw CustomResponse.NOT_FOUND('Jornada de trabalho não cadastrada!')

    return workSchedule
  }

  async findAll ({
    tenantId
  }: IFindAllModelsProps): Promise<Array<Partial<IWorkSchedule>>> {
    return await this.workScheduleRepositoryImp.findAll({
      tenantId
    })
  }

  async list (filters: IListWorkSchedulesFilters) {
    return await this.workScheduleRepositoryImp.list(filters)
  }

  async create (workSchedule: WorkScheduleModel): Promise<WorkScheduleModel> {
    this.validateDuplicatedName({
      name: workSchedule.name,
      tenantId: workSchedule.tenantId
    })

    const equipments = (await EquipmentServiceImp.findAll(workSchedule.tenantId)).docs

    if (equipments.length) {
      await Promise.all(
        equipments.map(async equipment => {
          try {
            await EquipmentServer.addWorkScheduleTemplate({
              equipmentIp: equipment.ip,
              workSchedule: {
                id: workSchedule._id!,
                name: workSchedule.name
              }
            })

            await EquipmentServer.addWorkSchedule({
              days: workSchedule.object.days,
              startTime: workSchedule.object.startTime,
              endTime: workSchedule.object.endTime,
              equipmentIp: equipment.ip,
              workScheduleId: workSchedule._id!
            })
          } catch (error) {
            console.log(`Create Work Schedule - MAP ERROR: ${error}`)
          }
        })
      )
    }

    return await this.workScheduleRepositoryImp.create(workSchedule)
  }

  async update ({
    id,
    tenantId,
    responsibleId,
    data
  }: IUpdateWorkScheduleProps): Promise<void> {
    const workSchedule = await this.findById({
      id,
      tenantId
    })

    const { name } = data

    if (name && name !== workSchedule.name) {
      await this.validateDuplicatedName({
        name,
        tenantId
      })
    }

    const updated = await this.workScheduleRepositoryImp.update({
      id,
      tenantId,
      data: {
        ...data,
        actions: [
          ...workSchedule.actions!,
          (
            data.deletionDate ? {
              action: ModelAction.delete,
              date: DateUtils.getCurrent(),
              userId: responsibleId
            } : {
              action: ModelAction.update,
              date: DateUtils.getCurrent(),
              userId: responsibleId
            }
          )
        ]
      }
    })

    if (!updated) {
      throw CustomResponse.INTERNAL_SERVER_ERROR('Ocorreu um erro ao tentar atualizar jornada de trabalho!', {
        workScheduleId: id
      })
    }
  }

  async delete ({
    id,
    tenantId,
    responsibleId
  }: IDeleteWorkScheduleProps) {
    const workSchedule = await this.findById({
      id,
      tenantId
    })

    // await this.validateDeletion(workSchedule)

    if (workSchedule.object.deletionDate) {
      throw CustomResponse.CONFLICT('Jornada de trabalho já removida!', {
        workScheduleId: id
      })
    }

    return await this.update({
      id,
      tenantId,
      data: {
        active: false,
        deletionDate: DateUtils.getCurrent()
      },
      responsibleId
    })
  }

  private async validateDuplicatedName ({
    name,
    tenantId
  }: IFindModelByNameProps): Promise<void> {
    const workSchedule = await this.workScheduleRepositoryImp.findByName({
      name,
      tenantId
    })

    if (workSchedule) throw CustomResponse.CONFLICT('Jornada de trabalho já cadastrada!')
  }
}
