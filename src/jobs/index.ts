import { CronJob } from 'cron'

import { SendPushNotifications } from './SendPushNotifications'
import { UpdateExpiringAccessReleaseInvitationGroups } from './UpdateExpiringAccessReleaseInvitationGroups'
import { UpdateExpiringAccessReleaseInvitations } from './UpdateExpiringAccessReleaseInvitations'
import { UpdateExpiringPasswordResetRequests } from './UpdateExpiringPasswordResetRequests'
import { UpdateExpiringTenants } from './UpdateExpiringTenants'

const executeJobs = () => {
  const updateExpiringTenantsJob = new CronJob('0 0 * * *', UpdateExpiringTenants)
  const updateExpiringAccessReleaseInvitationsJob = new CronJob('*/1 * * * *', UpdateExpiringAccessReleaseInvitations)
  const updateExpiringAccessReleaseInvitationGroupsJob = new CronJob('*/1 * * * *', UpdateExpiringAccessReleaseInvitationGroups)
  const UpdateExpiringPasswordResetRequestsJob = new CronJob('*/1 * * * *', UpdateExpiringPasswordResetRequests)
  const SendPushNotificationsJob = new CronJob('*/5 * * * * *', SendPushNotifications)

  updateExpiringTenantsJob.start()
  updateExpiringAccessReleaseInvitationsJob.start()
  updateExpiringAccessReleaseInvitationGroupsJob.start()
  UpdateExpiringPasswordResetRequestsJob.start()
  SendPushNotificationsJob.start()
}

export default executeJobs
