import schedule from 'node-schedule'

import { AccessReleaseServiceImp } from '../features/AccessRelease/AccessReleaseController'

export const UpdateExpiringAccessReleases = async () => {
  try {
    const accessReleases = await AccessReleaseServiceImp.findAllExpiringToday()

    console.log(`UpdateExpiringAccessReleases - ${accessReleases.length}`)

    if (accessReleases.length) {
      await Promise.all([
        accessReleases.forEach(async accessRelease => {
          const endDate = accessRelease.endDate!

          const adjustedExecutionDate = new Date(endDate)
          adjustedExecutionDate.setHours(endDate.getHours() + 3)

          schedule.scheduleJob(adjustedExecutionDate, async () => {
            await AccessReleaseServiceImp.disable({
              id: accessRelease._id!,
              tenantId: accessRelease.tenantId!
            })
          })
        })
      ])
    }
  } catch (error) {

  }
}
