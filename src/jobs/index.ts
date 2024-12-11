import { CronJob } from 'cron'

import { UpdateExpiringTenants } from './UpdateExpiringTenants'

const executeJobs = () => {
  const updateExpiringTenantsJob = new CronJob('0 0 * * *', UpdateExpiringTenants)

  updateExpiringTenantsJob.start()
}

export default executeJobs
