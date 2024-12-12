import { ClientSession } from 'mongoose'

import { IFindModelByIdProps } from './interfaces/Model'
import { IUpdateProps } from './interfaces/Repository'

export abstract class Repository<MongoDB, Model> {
  constructor (protected mongoDB: MongoDB) {
    this.mongoDB = mongoDB
  }

  abstract findById(props: IFindModelByIdProps): Promise<Model | null>

  abstract create(data: Model, session?: ClientSession): Promise<Model>

  abstract update(update: IUpdateProps): Promise<boolean>
}
