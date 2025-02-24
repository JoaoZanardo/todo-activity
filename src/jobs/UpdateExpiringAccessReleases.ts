import { AccessReleaseServiceImp } from '../features/AccessRelease/AccessReleaseController'
import { AccessReleaseStatus } from '../models/AccessRelease/AccessReleaseModel'
import { AccessReleaseRepositoryImp } from '../models/AccessRelease/AccessReleaseMongoDB'
import { DateUtils } from '../utils/Date'

export const UpdateExpiringAccessReleases = async () => {
  try {
    const accessReleases = await AccessReleaseRepositoryImp.findAllExpiringToday()

    console.log(`UpdateExpiringAccessReleases - ${accessReleases.length}`)

    if (accessReleases.length) {
      await Promise.all(
        accessReleases.map(async (accessRelease) => {
          try {
            if (accessRelease.endDate! > DateUtils.getCurrent()) {
              try {
                await AccessReleaseServiceImp.scheduleDisable({
                  accessReleaseId: accessRelease._id!,
                  endDate: accessRelease.endDate!,
                  tenantId: accessRelease.tenantId!,
                  status: AccessReleaseStatus.expired
                })
              } catch (error) {
                console.error(`Error scheduling disable: ${error}`)
              }
            } else {
              await AccessReleaseServiceImp.disable({
                id: accessRelease._id!,
                tenantId: accessRelease.tenantId!,
                status: AccessReleaseStatus.expired
              })
            }
          } catch (error) {
            console.error(`UpdateExpiringAccessReleasesError - MAP: ${error}`)
          }
        })
      )
    }
  } catch (error) {
    console.error(`UpdateExpiringAccessReleasesError: ${error}`)
  }
}
