/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Types } from 'mongoose'

import { IFindModelByIdProps } from '../../core/interfaces/Model'
import { IUpdateProps } from '../../core/interfaces/Repository'
import { Repository } from '../../core/Repository'
import { TenantModel } from './TenantModel'
import { ITenantMongoDB } from './TenantSchema'

export class TenantRepository extends Repository<ITenantMongoDB, TenantModel> {
  async findById ({
    id
  }: IFindModelByIdProps): Promise<TenantModel | null> {
    const document = await this.mongoDB.findById(id)
    if (!document) return null

    return new TenantModel(document)
  }

  async findOneById (id: Types.ObjectId): Promise<TenantModel | null> {
    const document = await this.mongoDB.findById(id)
    if (!document) return null

    return new TenantModel(document)
  }

  async findAll (): Promise<Array<TenantModel>> {
    const documents = await this.mongoDB.find()

    const models = documents.map(document => new TenantModel(document))

    return models
  }

  async create (data: TenantModel): Promise<TenantModel> {
    throw new Error('Not Implemented!')
  }

  async update (update: IUpdateProps): Promise<boolean> {
    throw new Error('Not Implemented!')
  }
}
