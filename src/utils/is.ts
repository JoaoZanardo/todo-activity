import moment from 'moment'
import mongoose from 'mongoose'

const is = {
  objectId: (value: any): boolean => mongoose.Types.ObjectId.isValid(value),
  string: (value: any) => typeof value === 'string',
  number: (value: any) => typeof value === 'number',
  email: (value: any): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  date: (value: any): boolean => {
    return (moment(value, 'DD/MM/YYYY', true).isValid() || moment(value, 'DD/MM/YYYY HH:mm', true).isValid())
  },
  array: (value: any) => Array.isArray(value),
  object: (variable:any): boolean => typeof variable === 'object' && variable !== null,
  boolean: (variable: any): boolean => ['true', true, 'false', false].includes(variable)

}

export default is
