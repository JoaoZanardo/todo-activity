import { Types } from 'mongoose'

export const getPersonCodeByPersonId = (personId: Types.ObjectId): string => {
  const str = String(personId).split('')

  let finalSum = 0

  str.forEach(letter => {
    if (Number(letter)) {
      finalSum += Number(letter)
    }
  })

  return String((finalSum * Math.floor(Math.random() * 99999)))
}
