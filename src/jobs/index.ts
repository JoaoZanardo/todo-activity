import { CronJob } from 'cron'
import schedule from 'node-schedule'

import { UpdateActiveExpiredAccessReleases } from './UpdateActiveExpiredAccessReleases'
import { UpdateAllScheduledAccessReleasesThatStarted } from './UpdateAllScheduledAccessReleasesThatStarted'
import { UpdateExpiringAccessReleaseInvitations } from './UpdateExpiringAccessReleaseInvitations'
import { UpdateExpiringAccessReleases } from './UpdateExpiringAccessReleases'
import { UpdateExpiringTenants } from './UpdateExpiringTenants'
import { UpdateStartingAccessReleases } from './UpdateStartingAccessReleases'

const executeJobs = () => {
  schedule.scheduleJob('00 03 * * *', () => UpdateExpiringAccessReleases()) // 00:00
  schedule.scheduleJob('00 03 * * *', () => UpdateStartingAccessReleases()) // 00:00

  const updateExpiringTenantsJob = new CronJob('0 0 * * *', UpdateExpiringTenants)

  // const updateActiveExpiredAccessReleasesJob = new CronJob('0 * * * *', UpdateActiveExpiredAccessReleases)
  const updateActiveExpiredAccessReleasesJob = new CronJob('*/10 * * * *', UpdateActiveExpiredAccessReleases)
  const updateAllScheduledAccessReleasesThatStartedJob = new CronJob('*/10 * * * *', UpdateAllScheduledAccessReleasesThatStarted)
  const updateExpiringAccessReleaseInvitations = new CronJob('*/1 * * * *', UpdateExpiringAccessReleaseInvitations)

  updateExpiringTenantsJob.start()
  updateActiveExpiredAccessReleasesJob.start()
  updateAllScheduledAccessReleasesThatStartedJob.start()
  updateExpiringAccessReleaseInvitations.start()
}

export default executeJobs
