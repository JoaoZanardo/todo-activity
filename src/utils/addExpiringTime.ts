import { ExpiringTime, TimeUnit } from '../models/PersonType/PersonTypeModel'
import { DateUtils } from './Date'

export const addExpiringTime = (expiringTime: ExpiringTime): Date => {
  const now = DateUtils.getCurrent()

  switch (expiringTime.unit) {
    case TimeUnit.hour:
      now.setHours(now.getHours() + expiringTime.value)
      break
    case TimeUnit.day:
      now.setDate(now.getDate() + expiringTime.value)
      break
    case TimeUnit.month:
      now.setMonth(now.getMonth() + expiringTime.value)
      break
    case TimeUnit.year:
      now.setFullYear(now.getFullYear() + expiringTime.value)
      break
  }

  return now
}
