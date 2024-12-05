import crypto from 'crypto'

import { DateUtils } from './Date'

export const generate = {
  establishmentCode: () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

    let code = ''

    for (let i = 0; i < 7; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length)
      code += chars[randomIndex]
    }
    return code
  },
  OTP: (): string => {
    const otp = String(Math.floor(1000 + Math.random() * 9000))
    return otp
  },
  tokenExpirationDate: (): Date => {
    const date = DateUtils.getCurrent()

    date.setHours(date.getHours() + 1)

    return date
  },
  passwordToken: () => crypto.randomBytes(32).toString('hex')
}
