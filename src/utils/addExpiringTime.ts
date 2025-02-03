import { ExpiringTime, TimeUnit } from '../models/PersonType/PersonTypeModel'

export const addExpiringTime = (expiringTime: ExpiringTime, date: Date): Date => {
  const newDate = new Date(date)

  switch (expiringTime.unit) {
    case TimeUnit.minute:
      newDate.setMinutes(newDate.getMinutes() + Number(expiringTime.value))
      break
    case TimeUnit.hour:
      newDate.setHours(newDate.getHours() + Number(expiringTime.value))
      break
    case TimeUnit.day:
      newDate.setDate(newDate.getDate() + Number(expiringTime.value))
      break
    case TimeUnit.month:
      newDate.setMonth(newDate.getMonth() + Number(expiringTime.value))
      break
    case TimeUnit.year:
      newDate.setFullYear(newDate.getFullYear() + Number(expiringTime.value))
      break
  }

  return newDate
}
