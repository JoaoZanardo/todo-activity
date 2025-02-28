import database from '../config/database'
import { AccessReleaseServiceImp } from '../features/AccessRelease/AccessReleaseController'
import { AccessReleaseStatus } from '../models/AccessRelease/AccessReleaseModel'
import { AccessReleaseRepositoryImp } from '../models/AccessRelease/AccessReleaseMongoDB'

export const UpdateActiveExpiredAccessReleases = async () => {
  const session = await database.startSession()
  session.startTransaction()

  try {
    const accessReleases = await AccessReleaseRepositoryImp.findAllActiveExpiredAccessReleases()

    console.log(`UpdateExpiringAccessReleases - ${accessReleases.length}`)

    if (accessReleases.length) {
      await Promise.all(
        accessReleases.map(async (accessRelease) => {
          await AccessReleaseServiceImp.disable({
            id: accessRelease._id!,
            tenantId: accessRelease.tenantId!,
            status: AccessReleaseStatus.expired,
            session
          })
        })
      )
    }

    await session.commitTransaction()
    session.endSession()
  } catch (error) {
    session.endSession()

    console.error(`UpdateActiveExpiredAccessReleases: ${error}`)
  }
}
