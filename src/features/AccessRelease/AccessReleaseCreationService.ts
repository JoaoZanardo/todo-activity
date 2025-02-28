import { ClientSession } from 'mongoose'
import schedule from 'node-schedule'

import database from '../../config/database'
import { ModelAction } from '../../core/interfaces/Model'
import { AccessReleaseModel, AccessReleaseStatus, AccessReleaseType, ICreateAccessReleaseByAccessReleaseInvitationIdProps } from '../../models/AccessRelease/AccessReleaseModel'
import { AccessReleaseRepositoryImp } from '../../models/AccessRelease/AccessReleaseMongoDB'
import { AccessReleaseInvitationStatus } from '../../models/AccessReleaseInvitation/AccessReleaseInvitationModel'
import CustomResponse from '../../utils/CustomResponse'
import { DateUtils } from '../../utils/Date'
import { AccessReleaseInvitationServiceImp } from '../AccessReleaseInvitation/AccessReleaseInvitationController'
import { AccessReleaseServiceImp } from './AccessReleaseController'

class AccessReleaseCreationService {
  async execute (accessRelease: AccessReleaseModel, session: ClientSession): Promise<AccessReleaseModel> {
    const { tenantId, personId } = accessRelease

    const lastAccessRelease = await AccessReleaseServiceImp.findLastByPersonId({
      personId,
      tenantId
    })

    this.validateAccessReleaseStatus(lastAccessRelease)

    if (!accessRelease.endDate && !accessRelease.expiringTime) accessRelease.endDate = DateUtils.getDefaultEndDate()

    const { initDate, endDate } = accessRelease.object

    if (endDate! < initDate!) throw CustomResponse.UNPROCESSABLE_ENTITY('A data de término deve ser maior que a data de início!')

    const createdAccessRelease = await AccessReleaseRepositoryImp.create(accessRelease, session)

    if (DateUtils.isToday(createdAccessRelease.endDate!)) {
      await AccessReleaseServiceImp.scheduleDisable({
        endDate: createdAccessRelease.endDate!,
        accessReleaseId: createdAccessRelease._id!,
        tenantId,
        status: AccessReleaseStatus.expired
      })
    }

    if (DateUtils.isToday(createdAccessRelease.object.initDate!)) {
      if (createdAccessRelease.initDate! > DateUtils.getCurrent()) {
        const adjustedExecutionDate = new Date(createdAccessRelease.initDate!)
        adjustedExecutionDate.setHours(createdAccessRelease.initDate!.getHours() + 3)

        schedule.scheduleJob(adjustedExecutionDate, async () => {
          const newSession = await database.startSession()
          newSession.startTransaction()

          try {
            await AccessReleaseServiceImp.syncPersonAccessWithEquipments({
              personId,
              tenantId,
              accessRelease: createdAccessRelease.object,
              session: newSession
            })

            await newSession.commitTransaction()
            newSession.endSession()
          } catch (error) {
            newSession.endSession()

            console.error('Erro ao adicionar acessos ao equipamentos:', error)
          }
        })
      } else {
        await AccessReleaseServiceImp.syncPersonAccessWithEquipments({
          personId,
          tenantId,
          accessRelease: createdAccessRelease.object,
          session
        })
      }
    }

    await session.commitTransaction()
    session.endSession()

    return await AccessReleaseServiceImp.findById({
      id: createdAccessRelease._id!,
      tenantId
    })
  }

  async createByAccessReleaseInvitationId ({
    accessReleaseInvitationId,
    tenantId,
    guestId,
    personTypeId,
    picture,
    session
  }: ICreateAccessReleaseByAccessReleaseInvitationIdProps): Promise<AccessReleaseModel> {
    const exists = await AccessReleaseServiceImp.findByAccessReleaseInvitationId({
      accessReleaseInvitationId,
      tenantId
    })

    if (exists) {
      throw CustomResponse.CONFLICT('Já existe uma liberação de acesso cadastrada com esse convite!', {
        accessReleaseInvitationId
      })
    }

    const lastAccessRelease = await AccessReleaseServiceImp.findLastByPersonId({
      personId: guestId,
      tenantId
    })

    this.validateAccessReleaseStatus(lastAccessRelease)

    const accessReleaseInvitation = await AccessReleaseInvitationServiceImp.findById({
      id: accessReleaseInvitationId,
      tenantId
    })

    await AccessReleaseInvitationServiceImp.update({
      id: accessReleaseInvitation._id!,
      tenantId,
      data: {
        status: AccessReleaseInvitationStatus.filled,
        guestId
      },
      session
    })

    const {
      initDate,
      endDate,
      personId,
      areaId,
      observation
    } = accessReleaseInvitation.object

    const accessReleaseModel = new AccessReleaseModel({
      picture,
      personTypeId,
      personId: guestId,
      responsibleId: personId,
      observation,
      tenantId,
      actions: [{
        action: ModelAction.create,
        date: DateUtils.getCurrent()
      }],
      type: AccessReleaseType.invite,
      status: AccessReleaseStatus.scheduled,
      finalAreaId: areaId,
      accessReleaseInvitationId: accessReleaseInvitation._id!,
      initDate: DateUtils.parse(initDate)!,
      endDate: DateUtils.parse(endDate)!
    })

    return await AccessReleaseRepositoryImp.create(accessReleaseModel, session)
  }

  private validateAccessReleaseStatus (accessRelease: AccessReleaseModel | null): void {
    if (
      accessRelease &&
      accessRelease.status === AccessReleaseStatus.active
    ) throw CustomResponse.CONFLICT('Essa pessoa já possui uma liberação de acesso!')
  }
}

export default new AccessReleaseCreationService()
