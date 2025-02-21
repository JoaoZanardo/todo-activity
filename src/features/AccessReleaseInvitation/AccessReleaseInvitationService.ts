import { IFindModelByIdProps, ModelAction } from '../../core/interfaces/Model'
import { IAggregatePaginate } from '../../core/interfaces/Repository'
import { AccessReleaseInvitationModel, AccessReleaseInvitationStatus, IAccessReleaseInvitation, IDeleteAccessReleaseInvitationProps, IListAccessReleaseInvitationsFilters, IUpdateAccessReleaseInvitationProps } from '../../models/AccessReleaseInvitation/AccessReleaseInvitationModel'
import { AccessReleaseInvitationRepositoryImp } from '../../models/AccessReleaseInvitation/AccessReleaseInvitationMongoDB'
import CustomResponse from '../../utils/CustomResponse'
import { DateUtils } from '../../utils/Date'

export class AccessReleaseInvitationService {
  constructor (
    private accessReleaseInvitationRepositoryImp: typeof AccessReleaseInvitationRepositoryImp
  ) {
    this.accessReleaseInvitationRepositoryImp = accessReleaseInvitationRepositoryImp
  }

  async list (filters: IListAccessReleaseInvitationsFilters): Promise<IAggregatePaginate<IAccessReleaseInvitation>> {
    return await this.accessReleaseInvitationRepositoryImp.list(filters)
  }

  async findById ({
    id,
    tenantId
  }: IFindModelByIdProps): Promise<AccessReleaseInvitationModel> {
    const accessReleaseInvitation = await this.accessReleaseInvitationRepositoryImp.findById({
      id,
      tenantId
    })
    if (!accessReleaseInvitation) throw CustomResponse.NOT_FOUND('Convite não cadastrado!')

    return accessReleaseInvitation
  }

  async findAllExpiring (): Promise<Array<Partial<IAccessReleaseInvitation>>> {
    return await this.accessReleaseInvitationRepositoryImp.findAllExpiring()
  }

  async create (accessReleaseInvitation: AccessReleaseInvitationModel): Promise<AccessReleaseInvitationModel> {
    return await this.accessReleaseInvitationRepositoryImp.create(accessReleaseInvitation)
  }

  async update ({
    id,
    tenantId,
    responsibleId,
    data
  }: IUpdateAccessReleaseInvitationProps): Promise<void> {
    const accessReleaseInvitation = await this.findById({
      id,
      tenantId
    })

    const updated = await this.accessReleaseInvitationRepositoryImp.update({
      id,
      tenantId,
      data: {
        ...data,
        actions: [
          ...accessReleaseInvitation.actions!,
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
      throw CustomResponse.INTERNAL_SERVER_ERROR('Ocorreu um erro ao tentar atualizar convite!', {
        accessReleaseInvitationId: id
      })
    }
  }

  async delete ({
    id,
    tenantId,
    responsibleId
  }: IDeleteAccessReleaseInvitationProps) {
    const accessReleaseInvitation = await this.findById({
      id,
      tenantId
    })

    if (accessReleaseInvitation.object.deletionDate) {
      throw CustomResponse.CONFLICT('Convite já removido!', {
        accessReleaseInvitationId: id
      })
    }

    if (accessReleaseInvitation.status === AccessReleaseInvitationStatus.filled) {
      throw CustomResponse.CONFLICT('Não é possível deletar um convite já preenchido!')
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
}
