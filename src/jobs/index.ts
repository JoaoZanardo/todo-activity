import { CronJob } from 'cron'

import { UpdateExpiringTenants } from './UpdateExpiringTenants'

const executeJobs = () => {
  const updateExpiringTenantsJob = new CronJob('0 0 * * *', UpdateExpiringTenants)
  // const inspectWorkSchedulesJob = new CronJob('* * * * *', inspectWorkSchedules)

  updateExpiringTenantsJob.start()
  // inspectWorkSchedulesJob.start()
}

export default executeJobs
