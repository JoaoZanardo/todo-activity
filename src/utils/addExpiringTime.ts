import { ExpiringTime, TimeUnit } from '../models/PersonType/PersonTypeModel'
import { DateUtils } from './Date'

export const addExpiringTime = (expiringTime: ExpiringTime): Date => {
  const now = DateUtils.getCurrent()

  switch (expiringTime.unit) {
    case TimeUnit.hour:
      now.setHours(now.getHours() + Number(expiringTime.value))
      break
    case TimeUnit.day:
      now.setDate(now.getDate() + Number(expiringTime.value))
      break
    case TimeUnit.month:
      now.setMonth(now.getMonth() + Number(expiringTime.value))
      break
    case TimeUnit.year:
      now.setFullYear(now.getFullYear() + Number(expiringTime.value))
      break
  }

  return now
}
