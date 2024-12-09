import { IFindModelByIdProps, ModelAction } from '../../core/interfaces/Model'
import { IAggregatePaginate } from '../../core/interfaces/Repository'
import { AccessGroupModel, IAccessGroup, IDeleteAccessGroupProps, IFindAccessGroupByNameProps, IFindAllAccessGroupsProps, IListAccessGroupsFilters, IUpdateAccessGroupProps } from '../../models/AccessGroup/AccessGroupModel'
import { AccessGroupRepositoryImp } from '../../models/AccessGroup/AccessGroupMongoDB'
import { UserModel } from '../../models/User/UserModel'
import CustomResponse from '../../utils/CustomResponse'
import { DateUtils } from '../../utils/Date'
import { UserServiceImp } from '../User/UserController'

export class AccessGroupService {
  constructor (
    private accessGroupRepositoryImp: typeof AccessGroupRepositoryImp
  ) {
    this.accessGroupRepositoryImp = accessGroupRepositoryImp
  }

  async findById ({
    id,
    tenantId
  }: IFindModelByIdProps): Promise<AccessGroupModel> {
    const accessGroup = await this.accessGroupRepositoryImp.findById({
      id,
      tenantId
    })
    if (!accessGroup) throw CustomResponse.NOT_FOUND('Grupo de acesso não cadastrado!')

    return accessGroup
  }

  async list (filters: IListAccessGroupsFilters): Promise<IAggregatePaginate<IAccessGroup>> {
    return await this.accessGroupRepositoryImp.list(filters)
  }

  async findAll ({
    tenantId,
    select
  }: IFindAllAccessGroupsProps): Promise<Array<Partial<IAccessGroup>>> {
    return await this.accessGroupRepositoryImp.findAll({
      tenantId,
      select
    })
  }

  async create (accessGroup: AccessGroupModel): Promise<AccessGroupModel> {
    await this.validateDuplicatedName(accessGroup)

    return await this.accessGroupRepositoryImp.create(accessGroup)
  }

  async update ({
    id,
    tenantId,
    responsibleId,
    data
  }: IUpdateAccessGroupProps): Promise<void> {
    const accessGroup = await this.findById({
      id,
      tenantId
    })

    const name = data.name

    if (name && name !== accessGroup.name) {
      await this.validateDuplicatedName({
        name,
        tenantId
      })
    }

    const updated = await this.accessGroupRepositoryImp.update({
      id,
      tenantId,
      data: {
        ...data,
        actions: [
          ...accessGroup.actions!,
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
      throw CustomResponse.INTERNAL_SERVER_ERROR('Ocorreu um erro ao tentar atualizar grupo de acesso!', {
        accessGroupId: id
      })
    }
  }

  async delete ({
    id,
    tenantId,
    responsibleId
  }: IDeleteAccessGroupProps) {
    const accessGroup = await this.findById({
      id,
      tenantId
    })

    await this.validateDeletion(accessGroup)

    if (accessGroup.object.deletionDate) {
      throw CustomResponse.CONFLICT('Grupo de acesso já removido!', {
        accessGroupId: id
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
  }: IFindAccessGroupByNameProps): Promise<void> {
    const exists = await this.accessGroupRepositoryImp.findByName({
      name,
      tenantId
    })

    if (exists) throw CustomResponse.CONFLICT('Nome de grupo de acesso já cadastrado!')
  }

  private async validateDeletion (accessGroup: AccessGroupModel): Promise<void> {
    const {
      tenantId,
      _id
    } = accessGroup

    const userFilters = UserModel.listFilters({
      tenantId,
      accessGroupId: _id
    })

    const users = await UserServiceImp.list(userFilters)

    if (users.totalDocs) throw CustomResponse.BAD_REQUEST('Existem usuários nesse grupo de acesso, não é possível remove-lo!')
  }
}
