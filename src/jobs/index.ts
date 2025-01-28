import { CronJob } from 'cron'
import schedule from 'node-schedule'

import { UpdateExpiringTenants } from './UpdateExpiringTenants'

const executeJobs = () => {
  schedule.scheduleJob('0 3 * * *', () => { // 00:00
  })

  const updateExpiringTenantsJob = new CronJob('0 0 * * *', UpdateExpiringTenants)
  // const inspectWorkSchedulesJob = new CronJob('* * * * *', inspectWorkSchedules)

  updateExpiringTenantsJob.start()
  // inspectWorkSchedulesJob.start()
}

export default executeJobs
