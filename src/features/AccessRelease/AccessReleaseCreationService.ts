import schedule from 'node-schedule'

import { AccessReleaseModel, AccessReleaseStatus } from '../../models/AccessRelease/AccessReleaseModel'
import { AccessReleaseRepositoryImp } from '../../models/AccessRelease/AccessReleaseMongoDB'
import CustomResponse from '../../utils/CustomResponse'
import { DateUtils } from '../../utils/Date'
import { AccessReleaseServiceImp } from './AccessReleaseController'

class AccessReleaseCreationService {
  async execute (accessRelease: AccessReleaseModel): Promise<AccessReleaseModel> {
    const { tenantId, personId } = accessRelease

    const lastAccessRelease = await AccessReleaseServiceImp.findLastByPersonId({
      personId,
      tenantId
    })

    this.validateAccessReleaseStatus(lastAccessRelease)

    if (!accessRelease.endDate && !accessRelease.expiringTime) accessRelease.endDate = DateUtils.getDefaultEndDate()

    const { initDate, endDate } = accessRelease.object

    if (endDate! < initDate!) throw CustomResponse.UNPROCESSABLE_ENTITY('A data de término deve ser maior que a data de início!')

    const createdAccessRelease = await AccessReleaseRepositoryImp.create(accessRelease)

    if (DateUtils.isToday(createdAccessRelease.endDate!)) {
      AccessReleaseServiceImp.scheduleDisable({
        endDate: createdAccessRelease.endDate!,
        accessReleaseId: createdAccessRelease._id!,
        tenantId,
        status: AccessReleaseStatus.expired
      })
    }

    if (DateUtils.isToday(createdAccessRelease.object.initDate!)) {
      const syncWithEquips = async () => {
        await AccessReleaseServiceImp.syncPersonAccessWithEquipments({
          personId,
          tenantId,
          accessRelease: createdAccessRelease.object
        })
      }

      if (createdAccessRelease.initDate! > DateUtils.getCurrent()) {
        const adjustedExecutionDate = new Date(createdAccessRelease.initDate!)
        adjustedExecutionDate.setHours(createdAccessRelease.initDate!.getHours() + 3)

        schedule.scheduleJob(adjustedExecutionDate, async () => {
          await syncWithEquips()
        })
      } else {
        await syncWithEquips()
      }
    }

    return await AccessReleaseServiceImp.findById({
      id: createdAccessRelease._id!,
      tenantId
    })
  }

  private validateAccessReleaseStatus (accessRelease: AccessReleaseModel | null): void {
    if (
      accessRelease &&
      accessRelease.status === AccessReleaseStatus.active
    ) throw CustomResponse.CONFLICT('Essa pessoa já possui uma liberação de acesso!')
  }
}

export default new AccessReleaseCreationService()
