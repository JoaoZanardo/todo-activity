import { PasswordResetRequestServiceImp } from '../features/PasswordResetRequest/PasswordResetRequestController'
import { PasswordResetRequestStatus } from '../models/PasswordResetRequest/PasswordResetRequestModel'

export const UpdateExpiringPasswordResetRequests = async () => {
  try {
    const pendingPasswordResetRequests = await PasswordResetRequestServiceImp.findAllExpiringVerifications()

    console.log(`UpdateExpiringPasswordResetRequests - ${pendingPasswordResetRequests.length}`)

    if (pendingPasswordResetRequests.length) {
      await Promise.all(
        pendingPasswordResetRequests.map(async passwordResetRequest => {
          await PasswordResetRequestServiceImp.update({
            id: passwordResetRequest._id!,
            tenantId: passwordResetRequest.tenantId,
            data: {
              status: PasswordResetRequestStatus.expired
            }
          })
        })
      )
    }
  } catch (error) {
    console.error('UpdateExpiringPasswordResetRequests Error: ', { error })
  }
}
