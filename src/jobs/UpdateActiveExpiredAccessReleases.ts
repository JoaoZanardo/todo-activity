import { AccessReleaseServiceImp } from '../features/AccessRelease/AccessReleaseController'
import { AccessReleaseStatus } from '../models/AccessRelease/AccessReleaseModel'
import { AccessReleaseRepositoryImp } from '../models/AccessRelease/AccessReleaseMongoDB'

export const UpdateActiveExpiredAccessReleases = async () => {
  try {
    const accessReleases = await AccessReleaseRepositoryImp.findAllActiveExpiredAccessReleases()

    console.log(`UpdateExpiringAccessReleases - ${accessReleases.length}`)

    if (accessReleases.length) {
      await Promise.all(
        accessReleases.map(async (accessRelease) => {
          try {
            await AccessReleaseServiceImp.disable({
              id: accessRelease._id!,
              tenantId: accessRelease.tenantId!,
              status: AccessReleaseStatus.expired
            })
          } catch (error) {
            console.error(`UpdateActiveExpiredAccessReleases - MAP: ${error}`)
          }
        })
      )
    }
  } catch (error) {
    console.error(`UpdateActiveExpiredAccessReleases: ${error}`)
  }
}
