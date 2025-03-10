import { PushNotificationServiceImp } from '../features/PushNotification/PushNotificationController'
import { UserServiceImp } from '../features/User/UserController'
import ExpoPushNotificationService from '../services/ExpoPushNotificationService'
import { DateUtils } from '../utils/Date'

export const SendPushNotifications = async () => {
  try {
    const unsentPushNotifications = await PushNotificationServiceImp.findAllUnsent()

    if (unsentPushNotifications.length) {
      await Promise.all(
        unsentPushNotifications.map(async pushNotification => {
          const tenantId = pushNotification.tenantId

          const user = await UserServiceImp.findById({
            id: pushNotification.object.userId,
            tenantId
          })

          if (user.pushToken) {
            await ExpoPushNotificationService.send({
              pushToken: user.pushToken,
              title: pushNotification.object.title,
              body: pushNotification.object.body,
              data: pushNotification.object.data
            })

            await PushNotificationServiceImp.update({
              id: pushNotification._id!,
              tenantId,
              data: {
                sent: true,
                sentAt: DateUtils.getCurrent()
              }
            })
          }
        })
      )
    }
  } catch (error) {
    console.log('SendPushNotifications Error: ', { error })
  }
}
