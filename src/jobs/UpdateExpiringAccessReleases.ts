import database from '../config/database'
import { AccessReleaseServiceImp } from '../features/AccessRelease/AccessReleaseController'
import { AccessReleaseStatus } from '../models/AccessRelease/AccessReleaseModel'
import { AccessReleaseRepositoryImp } from '../models/AccessRelease/AccessReleaseMongoDB'
import { DateUtils } from '../utils/Date'

export const UpdateExpiringAccessReleases = async () => {
  const session = await database.startSession()
  session.startTransaction()

  try {
    const accessReleases = await AccessReleaseRepositoryImp.findAllExpiringToday()

    console.log(`UpdateExpiringAccessReleases - ${accessReleases.length}`)

    if (accessReleases.length) {
      await Promise.all(
        accessReleases.map(async (accessRelease) => {
          if (accessRelease.endDate! > DateUtils.getCurrent()) {
            await AccessReleaseServiceImp.scheduleDisable({
              accessReleaseId: accessRelease._id!,
              endDate: accessRelease.endDate!,
              tenantId: accessRelease.tenantId!,
              status: AccessReleaseStatus.expired
            })
          } else {
            await AccessReleaseServiceImp.disable({
              id: accessRelease._id!,
              tenantId: accessRelease.tenantId!,
              status: AccessReleaseStatus.expired,
              session
            })
          }
        })
      )
    }

    await session.commitTransaction()
    session.endSession()
  } catch (error) {
    session.endSession()

    console.error(`UpdateExpiringAccessReleasesError: ${error}`)
  }
}
