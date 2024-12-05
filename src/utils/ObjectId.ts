import mongoose from 'mongoose'

import is from './is'

const ObjectId = (objectId: string | mongoose.Types.ObjectId) => {
  if (!is.objectId(objectId)) throw new Error('Invalid Object Id')
  return new mongoose.Types.ObjectId(objectId)
}

export default ObjectId
