/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable unused-imports/no-unused-vars */
import { ClientSession } from 'mongoose'

import { IFindModelByIdProps, ModelAction } from '../../core/interfaces/Model'
import { IUpdatePushNotificationProps, PushNotificationModel } from '../../models/PushNotification/PushNotificationModel'
import { PushNotificationRepositoryImp } from '../../models/PushNotification/PushNotificationMongoDB'
import CustomResponse from '../../utils/CustomResponse'
import { DateUtils } from '../../utils/Date'

export class PushNotificationService {
  constructor (
    private pushNotificationRepositoryImp: typeof PushNotificationRepositoryImp
  ) {
    this.pushNotificationRepositoryImp = pushNotificationRepositoryImp
  }

  async create (pushNotification: PushNotificationModel, session?: ClientSession): Promise<PushNotificationModel> {
    return await this.pushNotificationRepositoryImp.create(pushNotification, session)
  }

  async findAllUnsent (): Promise<Array<PushNotificationModel>> {
    return await this.pushNotificationRepositoryImp.findAllUnsent()
  }

  async findById ({
    id,
    tenantId
  }: IFindModelByIdProps): Promise<PushNotificationModel> {
    const pushNotification = await this.pushNotificationRepositoryImp.findById({
      id,
      tenantId
    })
    if (!pushNotification) throw CustomResponse.NOT_FOUND('Notificação não cadastrada!')

    return pushNotification
  }

  async update ({
    id,
    responsibleId,
    data,
    tenantId
  }: IUpdatePushNotificationProps): Promise<void> {
    const pushNotification = await this.findById({
      id,
      tenantId
    })

    const updated = await this.pushNotificationRepositoryImp.update({
      id,
      tenantId,
      data: {
        ...data,
        actions: [
          ...pushNotification.actions!,
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
      throw CustomResponse.INTERNAL_SERVER_ERROR('Ocorreu um erro ao tentar atualizar notificação!')
    }
  }
}
