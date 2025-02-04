import schedule from 'node-schedule'

import { AccessReleaseServiceImp } from '../features/AccessRelease/AccessReleaseController'
import { AccessReleaseStatus } from '../models/AccessRelease/AccessReleaseModel'
import { DateUtils } from '../utils/Date'

export const UpdateExpiringAccessReleases = async () => {
  try {
    const accessReleases = await AccessReleaseServiceImp.findAllExpiringToday()

    console.log(`UpdateExpiringAccessReleases - ${accessReleases.length}`)

    if (accessReleases.length) {
      await Promise.all([
        accessReleases.map(async accessRelease => {
          if (accessRelease.endDate! > DateUtils.getCurrent()) {
            const adjustedExecutionDate = new Date(accessRelease.endDate!)
            adjustedExecutionDate.setHours(accessRelease.endDate!.getHours() + 3)

            schedule.scheduleJob(adjustedExecutionDate, async () => {
              await AccessReleaseServiceImp.scheduleDisable({
                accessReleaseId: accessRelease._id!,
                endDate: accessRelease.endDate!,
                tenantId: accessRelease.tenantId!,
                status: AccessReleaseStatus.expired
              })
            })
          } else {
            await AccessReleaseServiceImp.disable({
              id: accessRelease._id!,
              tenantId: accessRelease.tenantId!,
              status: AccessReleaseStatus.expired
            })
          }
        })
      ])
    }
  } catch (error) {
    console.log(`UpdateExpiringAccessReleasesError - ${error}`)
  }
}
