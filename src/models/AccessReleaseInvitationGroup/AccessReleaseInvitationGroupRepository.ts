import { Aggregate } from 'mongoose'

import { IFindModelByIdProps } from '../../core/interfaces/Model'
import { IAggregatePaginate, IUpdateProps } from '../../core/interfaces/Repository'
import { Repository } from '../../core/Repository'
import { DateUtils } from '../../utils/Date'
import { AccessReleaseInvitationGroupModel, IAccessReleaseInvitationGroup, IFindAccessReleaseInvitationGroupByTitle, IListAccessReleaseInvitationGroupsFilters } from './AccessReleaseInvitationGroupModel'
import { IAccessReleaseInvitationGroupMongoDB } from './AccessReleaseInvitationGroupSchema'

export class AccessReleaseInvitationGroupRepository extends Repository<IAccessReleaseInvitationGroupMongoDB, AccessReleaseInvitationGroupModel> {
  async findById ({
    id,
    tenantId
  }: IFindModelByIdProps): Promise<AccessReleaseInvitationGroupModel | null> {
    const accessReleaseInvitationGroup = await this.mongoDB.findOne({
      _id: id,
      tenantId
    })

    if (!accessReleaseInvitationGroup) return null

    return new AccessReleaseInvitationGroupModel(accessReleaseInvitationGroup)
  }

  async findAllExpiring (): Promise<Array<Partial<IAccessReleaseInvitationGroup>>> {
    const currentDate = DateUtils.getCurrent()

    // add tenantId

    const documents = await this.mongoDB.find({
      deletionDate: null,
      endDate: {
        $lte: currentDate
      },
      active: true,
      expired: false
    }, ['_id', 'tenantId'])

    return documents
  }

  async findByTitle ({
    title,
    tenantId
  }: IFindAccessReleaseInvitationGroupByTitle): Promise<AccessReleaseInvitationGroupModel | null> {
    const accessReleaseInvitationGroup = await this.mongoDB.findOne({
      title,
      tenantId
    })

    if (!accessReleaseInvitationGroup) return null

    return new AccessReleaseInvitationGroupModel(accessReleaseInvitationGroup)
  }

  async create (accessReleaseInvitationGroup: AccessReleaseInvitationGroupModel): Promise<AccessReleaseInvitationGroupModel> {
    const document = await this.mongoDB.create(accessReleaseInvitationGroup.object)

    return new AccessReleaseInvitationGroupModel(document)
  }

  async update ({
    id,
    data,
    tenantId,
    session
  }: IUpdateProps<IAccessReleaseInvitationGroup>): Promise<boolean> {
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

  async list ({ limit, page, ...filters }: IListAccessReleaseInvitationGroupsFilters): Promise<IAggregatePaginate<IAccessReleaseInvitationGroup>> {
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
