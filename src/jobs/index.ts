const executeJobs = () => {
  // schedule.scheduleJob('00 03 * * *', () => UpdateExpiringAccessReleases()) // 00:00
  // schedule.scheduleJob('00 03 * * *', () => UpdateStartingAccessReleases()) // 00:00

  // const updateExpiringTenantsJob = new CronJob('0 0 * * *', UpdateExpiringTenants)

  // // const updateActiveExpiredAccessReleasesJob = new CronJob('0 * * * *', UpdateActiveExpiredAccessReleases)
  // const updateActiveExpiredAccessReleasesJob = new CronJob('*/10 * * * *', UpdateActiveExpiredAccessReleases)
  // const updateAllScheduledAccessReleasesThatStartedJob = new CronJob('*/10 * * * *', UpdateAllScheduledAccessReleasesThatStarted)

  // updateExpiringTenantsJob.start()
  // updateActiveExpiredAccessReleasesJob.start()
  // updateAllScheduledAccessReleasesThatStartedJob.start()
}

export default executeJobs
