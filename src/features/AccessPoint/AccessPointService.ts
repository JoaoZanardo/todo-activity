import { IFindAllModelsProps, IFindModelByIdProps, IFindModelByNameProps, ModelAction } from '../../core/interfaces/Model'
import { IAggregatePaginate } from '../../core/interfaces/Repository'
import { AccessPointModel, IAccessPoint, IListAccessPointsFilters, IUpdateAccessPointProps } from '../../models/AccessPoint/AccessPointModel'
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

  async findAll ({
    tenantId,
    select
  }: IFindAllModelsProps): Promise<Array<Partial<IAccessPoint>>> {
    return await this.accessPointRepositoryImp.findAll({
      tenantId,
      select
    })
  }

  async findById ({
    id,
    tenantId
  }: IFindModelByIdProps): Promise<AccessPointModel> {
    const accessPoint = await this.accessPointRepositoryImp.findById({
      id,
      tenantId
    })
    if (!accessPoint) throw CustomResponse.NOT_FOUND('Ponto de acesso não cadastrada!')

    return accessPoint
  }

  async create (accessPoint: AccessPointModel): Promise<AccessPointModel> {
    await this.validateDuplicatedName(accessPoint)

    return await this.accessPointRepositoryImp.create(accessPoint)
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
        tenantId
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
    tenantId
  }: IFindModelByNameProps): Promise<void> {
    const exists = await this.accessPointRepositoryImp.findByName({
      name,
      tenantId
    })

    if (exists) throw CustomResponse.CONFLICT('Nome de ponto de acesso já cadastrado!')
  }
}
