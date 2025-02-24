import { Types } from 'mongoose'

import { IFindModelByIdProps, ModelAction } from '../../core/interfaces/Model'
import { IAggregatePaginate } from '../../core/interfaces/Repository'
import { AccessPointModel, IAccessPoint, IFindAccessPointByEquipmentIdProps, IFindAccessPointByNameProps, IFindAllAccessPointsByAreaIdProps, IFindAllAccessPointsByPersonTypeIdProps, IListAccessPointsFilters, IRemoveEquipmentIdFromAccessPointProps, IUpdateAccessPointProps } from '../../models/AccessPoint/AccessPointModel'
import { AccessPointRepositoryImp } from '../../models/AccessPoint/AccessPointMongoDB'
import { IDeleteEquipmentProps } from '../../models/Equipment/EquipmentModel'
import CustomResponse from '../../utils/CustomResponse'
import { DateUtils } from '../../utils/Date'

export class AccessPointService {
  constructor (
    private accessPointRepositoryImp: typeof AccessPointRepositoryImp
  ) {
    this.accessPointRepositoryImp = accessPointRepositoryImp
  }

  async list (filters: IListAccessPointsFilters): Promise<IAggregatePaginate<IAccessPoint>> {
    return await this.accessPointRepositoryImp.list(filters)
  }

  async findAll (tenantId: Types.ObjectId): Promise<IAggregatePaginate<IAccessPoint>> {
    return await this.accessPointRepositoryImp.findAll(tenantId)
  }

  async findAllGeneralEntry (tenantId: Types.ObjectId): Promise<Array<Partial<IAccessPoint>>> {
    return await this.accessPointRepositoryImp.findAllGeneralEntry(tenantId)
  }

  async findById ({
    id,
    tenantId
  }: IFindModelByIdProps): Promise<AccessPointModel> {
    const accessPoint = await this.accessPointRepositoryImp.findById({
      id,
      tenantId
    })
    if (!accessPoint) throw CustomResponse.NOT_FOUND('Ponto de acesso não cadastrado!')

    return accessPoint
  }

  async findByEquipmentId ({
    equipmentId,
    tenantId
  }: IFindAccessPointByEquipmentIdProps): Promise<AccessPointModel> {
    const accessPoint = await this.accessPointRepositoryImp.findByEquipmentId({
      equipmentId,
      tenantId
    })
    if (!accessPoint) throw CustomResponse.NOT_FOUND('Ponto de acesso não cadastrado!')

    return accessPoint
  }

  async findAllByPersonTypeId ({
    personTypeId,
    tenantId
  }: IFindAllAccessPointsByPersonTypeIdProps): Promise<Array<Partial<IAccessPoint>>> {
    const accessPoint = await this.accessPointRepositoryImp.findAllByPersonTypeId({
      personTypeId,
      tenantId
    })
    if (!accessPoint) throw CustomResponse.NOT_FOUND('Ponto de acesso não cadastrado!')

    return accessPoint
  }

  async findAllByAreaId ({
    areaId,
    tenantId
  }: IFindAllAccessPointsByAreaIdProps): Promise<Array<Partial<IAccessPoint>>> {
    const accessPoints = await this.accessPointRepositoryImp.findAllByAreaId({
      areaId,
      tenantId
    })

    return accessPoints
  }

  async create (accessPoint: AccessPointModel): Promise<AccessPointModel> {
    await this.validateDuplicatedName(accessPoint)

    return await this.accessPointRepositoryImp.create(accessPoint)
  }

  async removeEquipmentId ({
    id,
    tenantId,
    equipmentId
  }: IRemoveEquipmentIdFromAccessPointProps): Promise<void> {
    const updated = await this.accessPointRepositoryImp.removeEquipmentId({
      id,
      tenantId,
      equipmentId
    })

    if (!updated) {
      throw CustomResponse.INTERNAL_SERVER_ERROR('Ocorreu um erro ao tentar remover equipamento do ponto de acesso!', {
        accessPointId: id
      })
    }
  }

  async update ({
    id,
    tenantId,
    responsibleId,
    data
  }: IUpdateAccessPointProps): Promise<void> {
    const accessPoint = await this.findById({
      id,
      tenantId
    })

    const { name } = data

    if (name && name !== accessPoint.name) {
      await this.validateDuplicatedName({
        name,
        tenantId,
        accessAreaId: accessPoint.accessAreaId,
        areaId: accessPoint.areaId
      })
    }

    const updated = await this.accessPointRepositoryImp.update({
      id,
      tenantId,
      data: {
        ...data,
        actions: [
          ...accessPoint.actions!,
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
      throw CustomResponse.INTERNAL_SERVER_ERROR('Ocorreu um erro ao tentar atualizar ponto de acesso!', {
        accessPointId: id
      })
    }
  }

  async delete ({
    id,
    tenantId,
    responsibleId
  }: IDeleteEquipmentProps) {
    const accessPoint = await this.findById({
      id,
      tenantId
    })

    // await this.validateDeletion(accessPoint)

    // Can't delete if veinculated to an AccessArea

    if (accessPoint.object.deletionDate) {
      throw CustomResponse.CONFLICT('Ponto de acesso já removido!', {
        accessPointId: id
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
    tenantId,
    accessAreaId,
    areaId
  }: IFindAccessPointByNameProps): Promise<void> {
    const exists = await this.accessPointRepositoryImp.findByName({
      name,
      tenantId,
      accessAreaId,
      areaId
    })

    if (exists) throw CustomResponse.CONFLICT('Nome de ponto de acesso já cadastrado!')
  }
}
