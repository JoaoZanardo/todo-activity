import { IFindModelByIdProps, ModelAction } from '../../core/interfaces/Model'
import { IAggregatePaginate } from '../../core/interfaces/Repository'
import { AccessReleaseInvitationGroupModel, IAccessReleaseInvitationGroup, IDeleteAccessReleaseInvitationGroupProps, IFindAccessReleaseInvitationGroupByTitle, IListAccessReleaseInvitationGroupsFilters, IUpdateAccessReleaseInvitationGroupProps } from '../../models/AccessReleaseInvitationGroup/AccessReleaseInvitationGroupModel'
import { AccessReleaseInvitationGroupRepositoryImp } from '../../models/AccessReleaseInvitationGroup/AccessReleaseInvitationGroupMongoDB'
import CustomResponse from '../../utils/CustomResponse'
import { DateUtils } from '../../utils/Date'

export class AccessReleaseInvitationGroupService {
  constructor (
    private accessReleaseInvitationGroupRepositoryImp: typeof AccessReleaseInvitationGroupRepositoryImp
  ) {
    this.accessReleaseInvitationGroupRepositoryImp = accessReleaseInvitationGroupRepositoryImp
  }

  async list (filters: IListAccessReleaseInvitationGroupsFilters): Promise<IAggregatePaginate<IAccessReleaseInvitationGroup>> {
    return await this.accessReleaseInvitationGroupRepositoryImp.list(filters)
  }

  async findById ({
    id,
    tenantId
  }: IFindModelByIdProps): Promise<AccessReleaseInvitationGroupModel> {
    const accessReleaseInvitationGroup = await this.accessReleaseInvitationGroupRepositoryImp.findById({
      id,
      tenantId
    })
    if (!accessReleaseInvitationGroup) throw CustomResponse.NOT_FOUND('Grupo de convite não cadastrado!')

    return accessReleaseInvitationGroup
  }

  async create (accessReleaseInvitationGroup: AccessReleaseInvitationGroupModel): Promise<AccessReleaseInvitationGroupModel> {
    await this.validateDuplicatedTitle({
      title: accessReleaseInvitationGroup.title,
      tenantId: accessReleaseInvitationGroup.tenantId
    })

    return await this.accessReleaseInvitationGroupRepositoryImp.create(accessReleaseInvitationGroup)
  }

  async update ({
    id,
    tenantId,
    responsibleId,
    data,
    session
  }: IUpdateAccessReleaseInvitationGroupProps): Promise<void> {
    const accessReleaseInvitationGroup = await this.findById({
      id,
      tenantId
    })

    const updated = await this.accessReleaseInvitationGroupRepositoryImp.update({
      id,
      tenantId,
      data: {
        ...data,
        actions: [
          ...accessReleaseInvitationGroup.actions!,
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
      },
      session
    })

    if (!updated) {
      throw CustomResponse.INTERNAL_SERVER_ERROR('Ocorreu um erro ao tentar atualizar convite!', {
        accessReleaseInvitationGroupId: id
      })
    }
  }

  async delete ({
    id,
    tenantId,
    responsibleId
  }: IDeleteAccessReleaseInvitationGroupProps) {
    const accessReleaseInvitationGroup = await this.findById({
      id,
      tenantId
    })

    if (accessReleaseInvitationGroup.object.deletionDate) {
      throw CustomResponse.CONFLICT('Convite já removido!', {
        accessReleaseInvitationGroupId: id
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

  private async validateDuplicatedTitle ({
    title,
    tenantId
  }: IFindAccessReleaseInvitationGroupByTitle): Promise<void> {
    const exists = await this.accessReleaseInvitationGroupRepositoryImp.findByTitle({
      title,
      tenantId
    })

    if (exists) throw CustomResponse.CONFLICT('Nome de evento já cadastrado!')
  }
}
