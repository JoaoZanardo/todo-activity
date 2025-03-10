import Expo, { ExpoPushMessage } from 'expo-server-sdk'
import { Types } from 'mongoose'

import env from '../config/env'

export interface ISendPushNotificationProps {
    pushToken: string
    title: string
    body: string
    data: {
      redirect?: {
        screen: string
        params?: { [key: string]: string }
      }
      userId?: Types.ObjectId
    }
}

class ExpoPushNotificationService {
  private expo: Expo

  constructor (expoAccessToken: string = env.expoAccessToken) {
    this.expo = new Expo({
      accessToken: expoAccessToken,
      useFcmV1: true
    })
  }

  async send ({
    pushToken,
    title,
    body,
    data
  }: ISendPushNotificationProps): Promise<void> {
    try {
      const message: ExpoPushMessage = {
        to: pushToken,
        sound: 'default',
        title,
        body,
        data
      }

      const chunks = this.expo.chunkPushNotifications([message])
      const tickets = []

      await Promise.all([
        chunks.map(async chunk => {
          const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk)

          tickets.push(...ticketChunk)
        })
      ])
    } catch (error) {
      console.log('Error sending push notifications: ', { error })
    }
  }
}

export default new ExpoPushNotificationService()
