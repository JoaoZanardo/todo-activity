import mongoose from 'mongoose'

export const coreSchema = {
  actions: Array,
  active: {
    type: Boolean,
    default: true
  },
  tenantId: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  createdAt: Date,
  deletionDate: Date
}

export default class Schema<T> {
  // eslint-disable-next-line no-useless-constructor
  constructor (private _schema: mongoose.Schema<T>) { }

  get schema (): mongoose.Schema<T> {
    return this._schema
  }
}
