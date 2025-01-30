import { AccessReleaseServiceImp } from '../features/AccessRelease/AccessReleaseController'

export const UpdateExpiringAccessReleases = async () => {
  try {
    const accessReleases = await AccessReleaseServiceImp.findAllExpiringToday()

    console.log(`UpdateExpiringAccessReleases - ${accessReleases.length}`)

    if (accessReleases.length) {
      await Promise.all([
        accessReleases.forEach(async accessRelease => {
          await AccessReleaseServiceImp.scheduleDisable({
            accessReleaseId: accessRelease._id!,
            endDate: accessRelease.endDate!,
            tenantId: accessRelease.tenantId!
          })
        })
      ])
    }
  } catch (error) {

  }
}
