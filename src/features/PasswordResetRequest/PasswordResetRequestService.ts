/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable unused-imports/no-unused-vars */

import { IFindModelByIdProps, ModelAction } from '../../core/interfaces/Model'
import { IFindPasswordResetRequestByTokenProps, IFindPasswordResetRequestByUserIdProps, IUpdatePasswordResetRequestProps, PasswordResetRequestModel } from '../../models/PasswordResetRequest/PasswordResetRequestModel'
import { PasswordResetRequestRepositoryImp } from '../../models/PasswordResetRequest/PasswordResetRequestMongoDB'
import CustomResponse from '../../utils/CustomResponse'
import { DateUtils } from '../../utils/Date'

export class PasswordResetRequestService {
  constructor (
    private passwordResetRequestRepositoryImp: typeof PasswordResetRequestRepositoryImp
  ) {
    this.passwordResetRequestRepositoryImp = passwordResetRequestRepositoryImp
  }

  async create (PasswordResetRequest: PasswordResetRequestModel): Promise<PasswordResetRequestModel> {
    return await this.passwordResetRequestRepositoryImp.create(PasswordResetRequest)
  }

  async findById ({
    id,
    tenantId
  }: IFindModelByIdProps): Promise<PasswordResetRequestModel> {
    const passwordResetRequest = await this.passwordResetRequestRepositoryImp.findById({
      id,
      tenantId
    })
    if (!passwordResetRequest) throw CustomResponse.NOT_FOUND('Requisição de redefinição de senha não cadastrada!')

    return passwordResetRequest
  }

  async findInProcessByuserId ({
    userId,
    tenantId
  }: IFindPasswordResetRequestByUserIdProps): Promise<PasswordResetRequestModel> {
    const passwordResetRequest = await this.passwordResetRequestRepositoryImp.findInProcessByUserId({
      userId,
      tenantId
    })
    if (!passwordResetRequest) throw CustomResponse.NOT_FOUND('Requisição de redefinição de senha não cadastrada!')

    return passwordResetRequest
  }

  async findByToken ({
    token,
    tenantId
  }: IFindPasswordResetRequestByTokenProps): Promise<PasswordResetRequestModel> {
    const passwordResetRequest = await this.passwordResetRequestRepositoryImp.findByToken({
      token,
      tenantId
    })
    if (!passwordResetRequest) throw CustomResponse.NOT_FOUND('Requisição de redefinição de senha não cadastrada!')

    return passwordResetRequest
  }

  async findPendingByUserId ({
    userId,
    tenantId
  }: IFindPasswordResetRequestByUserIdProps): Promise<PasswordResetRequestModel> {
    const passwordResetRequest = await this.passwordResetRequestRepositoryImp.findPendingByUserId({
      userId,
      tenantId
    })
    if (!passwordResetRequest) throw CustomResponse.NOT_FOUND('Verificação não cadastrada!')

    return passwordResetRequest
  }

  async findAllExpiringVerifications (): Promise<Array<PasswordResetRequestModel>> {
    return await this.passwordResetRequestRepositoryImp.findAllExpiringVerifications()
  }

  async update ({
    id,
    responsibleId,
    data,
    tenantId,
    session
  }: IUpdatePasswordResetRequestProps): Promise<void> {
    const passwordResetRequest = await this.findById({
      id,
      tenantId
    })

    if (data.status) {
      data.statusDates = passwordResetRequest.object.statusDates!

      data.statusDates[data.status] = DateUtils.getCurrent()
    }

    const updated = await this.passwordResetRequestRepositoryImp.update({
      id,
      tenantId,
      data: {
        ...data,
        actions: [
          ...passwordResetRequest.actions!,
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
      throw CustomResponse.INTERNAL_SERVER_ERROR('Ocorreu um erro ao tentar atualizar requisição de redefinição de senha!')
    }
  }
}
