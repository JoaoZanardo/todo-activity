import { Aggregate } from 'mongoose'

import { IFindModelByIdProps } from '../../core/interfaces/Model'
import { IAggregatePaginate, IUpdateProps } from '../../core/interfaces/Repository'
import { Repository } from '../../core/Repository'
import { DateUtils } from '../../utils/Date'
import { IFindPasswordResetRequestByTokenProps, IFindPasswordResetRequestByUserIdProps, IListPasswordResetRequestsFilters, IPasswordResetRequest, PasswordResetRequestModel, PasswordResetRequestStatus } from './PasswordResetRequestModel'
import { IPasswordResetRequestMongoDB } from './PasswordResetRequestSchema'

export class PasswordResetRequestRepository extends Repository<IPasswordResetRequestMongoDB, PasswordResetRequestModel> {
  async findById ({
    id,
    tenantId
  }: IFindModelByIdProps): Promise<PasswordResetRequestModel | null> {
    const document = await this.mongoDB.findOne({
      _id: id,
      tenantId,
      deletionDate: null
    })
    if (!document) return null

    return new PasswordResetRequestModel(document)
  }

  async findInProcessByUserId ({
    userId,
    tenantId
  }: IFindPasswordResetRequestByUserIdProps): Promise<PasswordResetRequestModel | null> {
    const document = await this.mongoDB.findOne({
      userId,
      tenantId,
      status: PasswordResetRequestStatus.pending,
      deletionDate: null
    })
    if (!document) return null

    return new PasswordResetRequestModel(document)
  }

  async findByToken ({
    token,
    tenantId
  }: IFindPasswordResetRequestByTokenProps): Promise<PasswordResetRequestModel | null> {
    const document = await this.mongoDB.findOne({
      token,
      tenantId,
      deletionDate: null
    })
    if (!document) return null

    return new PasswordResetRequestModel(document)
  }

  async findPendingByUserId ({
    userId,
    tenantId
  }: IFindPasswordResetRequestByUserIdProps): Promise<PasswordResetRequestModel | null> {
    const document = await this.mongoDB.findOne({
      userId,
      tenantId,
      status: PasswordResetRequestStatus.pending,
      deletionDate: null
    })
    if (!document) return null

    return new PasswordResetRequestModel(document)
  }

  async findAllExpiringVerifications (): Promise<Array<PasswordResetRequestModel>> {
    const currentDate = DateUtils.getCurrent()

    const documents = await this.mongoDB.find({
      status: PasswordResetRequestStatus.pending,
      expirationDate: { $lt: currentDate },
      deletionDate: null
    })

    const models = documents.map(document => new PasswordResetRequestModel(document))

    return models
  }

  async create (passwordResetRequest: PasswordResetRequestModel): Promise<PasswordResetRequestModel> {
    const document = await this.mongoDB.create(passwordResetRequest.object)

    return new PasswordResetRequestModel(document)
  }

  async update ({
    id,
    tenantId,
    data,
    session
  }: IUpdateProps<IPasswordResetRequest>): Promise<boolean> {
    const updated = await this.mongoDB.updateOne({
      _id: id,
      tenantId
    }, {
      $set: data
    }, {
      session
    })

    return !!updated.modifiedCount
  }

  async list ({ limit, page, ...filters }: IListPasswordResetRequestsFilters): Promise<IAggregatePaginate<IPasswordResetRequest>> {
    const aggregationStages: Aggregate<Array<any>> = this.mongoDB.aggregate([
      { $match: filters },
      { $sort: { _id: -1 } }
    ])

    return await this.mongoDB.aggregatePaginate(
      aggregationStages,
      {
        limit,
        page
      })
  }
}
