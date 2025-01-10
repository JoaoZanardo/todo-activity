import { IFindAllModelsProps, IFindModelByIdProps, ModelAction } from '../../core/interfaces/Model'
import { IAggregatePaginate } from '../../core/interfaces/Repository'
import { AccessAreaModel, IAccessArea, IFindAccessAreaByNameProps, IListAccessAreasFilters, IUpdateAccessAreaProps } from '../../models/AccessArea/AccessAreaModel'
import { AccessAreaRepositoryImp } from '../../models/AccessArea/AccessAreaMongoDB'
import { IDeleteEquipmentProps } from '../../models/Equipment/EquipmentModel'
import CustomResponse from '../../utils/CustomResponse'
import { DateUtils } from '../../utils/Date'

export class AccessAreaService {
  constructor (
    private accessAreaRepositoryImp: typeof AccessAreaRepositoryImp
  ) {
    this.accessAreaRepositoryImp = accessAreaRepositoryImp
  }

  async list (filters: IListAccessAreasFilters): Promise<IAggregatePaginate<IAccessArea>> {
    return await this.accessAreaRepositoryImp.list(filters)
  }

  async findAll ({
    tenantId,
    select
  }: IFindAllModelsProps): Promise<Array<Partial<IAccessArea>>> {
    return await this.accessAreaRepositoryImp.findAll({
      tenantId,
      select
    })
  }

  async findById ({
    id,
    tenantId
  }: IFindModelByIdProps): Promise<AccessAreaModel> {
    const accessArea = await this.accessAreaRepositoryImp.findById({
      id,
      tenantId
    })
    if (!accessArea) throw CustomResponse.NOT_FOUND('Área de acesso não cadastrada!')

    return accessArea
  }

  async create (accessArea: AccessAreaModel): Promise<AccessAreaModel> {
    await this.validateDuplicatedName(accessArea)

    return await this.accessAreaRepositoryImp.create(accessArea)
  }

  async update ({
    id,
    tenantId,
    responsibleId,
    data
  }: IUpdateAccessAreaProps): Promise<void> {
    const accessArea = await this.findById({
      id,
      tenantId
    })

    const { name } = data

    if (name && name !== accessArea.name) {
      await this.validateDuplicatedName({
        name,
        tenantId,
        areaId: accessArea.areaId
      })
    }

    const updated = await this.accessAreaRepositoryImp.update({
      id,
      tenantId,
      data: {
        ...data,
        actions: [
          ...accessArea.actions!,
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
      throw CustomResponse.INTERNAL_SERVER_ERROR('Ocorreu um erro ao tentar atualizar área de acesso!', {
        accessAreaId: id
      })
    }
  }

  async delete ({
    id,
    tenantId,
    responsibleId
  }: IDeleteEquipmentProps) {
    const accessArea = await this.findById({
      id,
      tenantId
    })

    // await this.validateDeletion(accessArea)

    // Can't delete if veinculated to an Area

    if (accessArea.object.deletionDate) {
      throw CustomResponse.CONFLICT('Área de acesso já removida!', {
        accessAreaId: id
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
    areaId
  }: IFindAccessAreaByNameProps): Promise<void> {
    const exists = await this.accessAreaRepositoryImp.findByName({
      areaId,
      name,
      tenantId
    })

    if (exists) throw CustomResponse.CONFLICT('Nome de área de acesso de acesso já cadastrado!')
  }
}
