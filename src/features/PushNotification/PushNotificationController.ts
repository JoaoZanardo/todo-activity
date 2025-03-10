import { Router } from 'express'

import { Controller } from '../../core/Controller'
import Rules from '../../core/Rules'
import { PushNotificationRepositoryImp } from '../../models/PushNotification/PushNotificationMongoDB'
import { PushNotificationService } from './PushNotificationService'

export const PushNotificationServiceImp = new PushNotificationService(
  PushNotificationRepositoryImp
)

class PushNotificationController extends Controller {
  protected rules: Rules = new Rules()

  handle (): Router {
    return this.router
  }
}

const pushNotificationController = new PushNotificationController()
export default pushNotificationController.handle()
