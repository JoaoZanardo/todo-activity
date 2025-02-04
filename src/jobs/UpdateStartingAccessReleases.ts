import { ModelAction } from '../core/interfaces/Model'
import { AccessReleaseServiceImp } from '../features/AccessRelease/AccessReleaseController'
import { AccessReleaseStatus, IAccessRelease } from '../models/AccessRelease/AccessReleaseModel'
import { AccessReleaseRepositoryImp } from '../models/AccessRelease/AccessReleaseMongoDB'
import { DateUtils } from '../utils/Date'

export const UpdateStartingAccessReleases = async () => {
  try {
    const accessReleases = await AccessReleaseServiceImp.findAllStartingToday()

    console.log(`UpdateStartingAccessReleases - ${accessReleases.length}`)

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
            }
          } catch (error) {
            console.log(`UpdateStartingAccessReleasesError - MAP: ${error}`)
          }
        })
      ])
    }
  } catch (error) {
    console.log(`UpdateStartingAccessReleasesError: ${error}`)
  }
}
