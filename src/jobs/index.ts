import { CronJob } from 'cron'

import { inspectWorkSchedules } from './inspectWorkSchedules'
import { UpdateExpiringTenants } from './UpdateExpiringTenants'

const executeJobs = () => {
  const updateExpiringTenantsJob = new CronJob('0 0 * * *', UpdateExpiringTenants)
  const inspectWorkSchedulesJob = new CronJob('*/5 * * * * *', inspectWorkSchedules)

  updateExpiringTenantsJob.start()
  inspectWorkSchedulesJob.start()
}

export default executeJobs
