import { ModelAction } from '../core/interfaces/Model'
import { AccessReleaseServiceImp } from '../features/AccessRelease/AccessReleaseController'
import { AccessReleaseStatus, IAccessRelease } from '../models/AccessRelease/AccessReleaseModel'
import { AccessReleaseRepositoryImp } from '../models/AccessRelease/AccessReleaseMongoDB'
import { DateUtils } from '../utils/Date'

export const UpdateAllScheduledAccessReleasesThatStarted = async () => {
  try {
    const accessReleases = await AccessReleaseRepositoryImp.findAllScheduledAccessReleasesThatStarted()

    console.log(`UpdateAllScheduledAccessReleasesThatStarted - ${accessReleases.length}`)

    if (accessReleases.length) {
      await Promise.all([
        accessReleases.map(async accessRelease => {
          try {
            const tenantId = accessRelease.tenantId!

            const lastAccessRelease = await AccessReleaseServiceImp.findLastByPersonId({
              personId: accessRelease.personId!,
              tenantId
            })

            if (
              lastAccessRelease &&
              lastAccessRelease.status === AccessReleaseStatus.active
            ) {
              await AccessReleaseRepositoryImp.update({
                id: accessRelease._id!,
                tenantId,
                data: {
                  actions: [
                    ...accessRelease.actions!,
                    {
                      action: ModelAction.update,
                      date: DateUtils.getCurrent()
                    }
                  ],
                  active: false,
                  status: AccessReleaseStatus.conflict
                }
              })
            } else {
              await AccessReleaseServiceImp.syncPersonAccessWithEquipments({
                accessRelease: accessRelease as IAccessRelease,
                personId: accessRelease.personId!,
                tenantId
              })

              if (DateUtils.isToday(accessRelease.endDate!)) {
                AccessReleaseServiceImp.scheduleDisable({
                  endDate: accessRelease.endDate!,
                  accessReleaseId: accessRelease._id!,
                  tenantId,
                  status: AccessReleaseStatus.expired
                })
              }
            }
          } catch (error) {
            console.log(`UpdateAllScheduledAccessReleasesThatStartedError - MAP: ${error}`)
          }
        })
      ])
    }
  } catch (error) {
    console.log(`UpdateAllScheduledAccessReleasesThatStartedError: ${error}`)
  }
}
