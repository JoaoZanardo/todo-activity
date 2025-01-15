import { Types } from 'mongoose'

import { IFindModelByIdProps, ModelAction } from '../../core/interfaces/Model'
import { IAggregatePaginate } from '../../core/interfaces/Repository'
import { AreaModel, IArea, IFindAreaByNameProps, IListAreasFilters, IUpdateAreaProps } from '../../models/Area/AreaModel'
import { AreaRepositoryImp } from '../../models/Area/AreaMongoDB'
import { IDeleteEquipmentProps } from '../../models/Equipment/EquipmentModel'
import CustomResponse from '../../utils/CustomResponse'
import { DateUtils } from '../../utils/Date'

export class AreaService {
  constructor (
    private areaRepositoryImp: typeof AreaRepositoryImp
  ) {
    this.areaRepositoryImp = areaRepositoryImp
  }

  async list (filters: IListAreasFilters): Promise<IAggregatePaginate<IArea>> {
    return await this.areaRepositoryImp.list(filters)
  }

  async findAll (tenantId: Types.ObjectId): Promise<IAggregatePaginate<IArea>> {
    return await this.areaRepositoryImp.findAll(tenantId)
  }

  async findById ({
    id,
    tenantId
  }: IFindModelByIdProps): Promise<AreaModel> {
    const area = await this.areaRepositoryImp.findById({
      id,
      tenantId
    })
    if (!area) throw CustomResponse.NOT_FOUND('Área não cadastrada!')

    return area
  }

  async findMain (tenantId: Types.ObjectId): Promise<AreaModel> {
    const area = await this.areaRepositoryImp.findMain(tenantId)
    if (!area) throw CustomResponse.NOT_FOUND('Área não cadastrada!')

    return area
  }

  async create (area: AreaModel): Promise<AreaModel> {
    await this.validateDuplicatedName(area)

    return await this.areaRepositoryImp.create(area)
  }

  async update ({
    id,
    tenantId,
    responsibleId,
    data
  }: IUpdateAreaProps): Promise<void> {
    const area = await this.findById({
      id,
      tenantId
    })

    const { name } = data

    if (name && name !== area.name) {
      await this.validateDuplicatedName({
        name,
        tenantId,
        areaId: area.areaId
      })
    }

    const updated = await this.areaRepositoryImp.update({
      id,
      tenantId,
      data: {
        ...data,
        actions: [
          ...area.actions!,
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
      throw CustomResponse.INTERNAL_SERVER_ERROR('Ocorreu um erro ao tentar atualizar área!', {
        areaId: id
      })
    }
  }

  async delete ({
    id,
    tenantId,
    responsibleId
  }: IDeleteEquipmentProps) {
    const area = await this.findById({
      id,
      tenantId
    })

    // await this.validateDeletion(area)

    // Can't delete if veinculated to an Area

    if (area.object.deletionDate) {
      throw CustomResponse.CONFLICT('Área já removida!', {
        areaId: id
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
    areaId,
    tenantId
  }: IFindAreaByNameProps): Promise<void> {
    const exists = await this.areaRepositoryImp.findByName({
      name,
      areaId,
      tenantId
    })

    if (exists) throw CustomResponse.CONFLICT('Nome área já cadastrado!')
  }
}
