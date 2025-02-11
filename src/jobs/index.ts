import { CronJob } from 'cron'
import schedule from 'node-schedule'

import { UpdateExpiringAccessReleases } from './UpdateExpiringAccessReleases'
import { UpdateExpiringTenants } from './UpdateExpiringTenants'
import { UpdateStartingAccessReleases } from './UpdateStartingAccessReleases'

const executeJobs = () => {
  schedule.scheduleJob('00 03 * * *', () => UpdateExpiringAccessReleases()) // 00:00
  schedule.scheduleJob('00 03 * * *', () => UpdateStartingAccessReleases()) // 00:00

  const updateExpiringTenantsJob = new CronJob('0 0 * * *', UpdateExpiringTenants)

  const updateExpiringAccessReleasesJob = new CronJob('0 * * * *', UpdateExpiringAccessReleases)
  const updateStartingAccessReleasesJob = new CronJob('0 * * * *', UpdateStartingAccessReleases)

  updateExpiringTenantsJob.start()
  updateExpiringAccessReleasesJob.start()
  updateStartingAccessReleasesJob.start()
}

export default executeJobs
