import { IFindModelByIdProps } from '../../core/interfaces/Model'
import { IAggregatePaginate } from '../../core/interfaces/Repository'
import { AccessReleaseInvitationModel, IAccessReleaseInvitation, IListAccessReleaseInvitationsFilters } from '../../models/AccessReleaseInvitation/AccessReleaseInvitationModel'
import { AccessReleaseInvitationRepositoryImp } from '../../models/AccessReleaseInvitation/AccessReleaseInvitationMongoDB'
import CustomResponse from '../../utils/CustomResponse'

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
    if (!accessReleaseInvitation) throw CustomResponse.NOT_FOUND('Liberação de acesso não cadastrado!')

    return accessReleaseInvitation
  }

  async create (accessReleaseInvitation: AccessReleaseInvitationModel): Promise<AccessReleaseInvitationModel> {
    return await this.accessReleaseInvitationRepositoryImp.create(accessReleaseInvitation)
  }
}
