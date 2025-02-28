import { Aggregate } from 'mongoose'

import { IFindModelByIdProps } from '../../core/interfaces/Model'
import { IAggregatePaginate, IUpdateProps } from '../../core/interfaces/Repository'
import { Repository } from '../../core/Repository'
import { DateUtils } from '../../utils/Date'
import { AccessReleaseInvitationModel, AccessReleaseInvitationStatus, IAccessReleaseInvitation, IListAccessReleaseInvitationsFilters } from './AccessReleaseInvitationModel'
import { IAccessReleaseInvitationMongoDB } from './AccessReleaseInvitationSchema'

export class AccessReleaseInvitationRepository extends Repository<IAccessReleaseInvitationMongoDB, AccessReleaseInvitationModel> {
  async findById ({
    id,
    tenantId
  }: IFindModelByIdProps): Promise<AccessReleaseInvitationModel | null> {
    const aggregationStages: Aggregate<Array<any>> = this.mongoDB.aggregate([
      {
        $match: {
          _id: id,
          tenantId,
          deletionDate: null
        }
      },
      {
        $lookup: {
          from: 'tenants',
          localField: 'tenantId',
          foreignField: '_id',
          as: 'tenant'
        }
      },
      {
        $unwind: '$tenant'
      },
      {
        $lookup: {
          from: 'people',
          localField: 'personId',
          foreignField: '_id',
          as: 'person'
        }
      },
      {
        $unwind: '$person'
      },
      {
        $lookup: {
          from: 'areas',
          localField: 'areaId',
          foreignField: '_id',
          as: 'area'
        }
      },
      {
        $unwind: '$area'
      },
      {
        $lookup: {
          from: 'people',
          localField: 'guestId',
          foreignField: '_id',
          as: 'guest'
        }
      },
      {
        $unwind: {
          path: '$guest',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'accessreleaseinvitationgroups',
          localField: 'accessReleaseInvitationGroupId',
          foreignField: '_id',
          as: 'accessReleaseInvitationGroup'
        }
      },
      {
        $unwind: {
          path: '$accessReleaseInvitationGroup',
          preserveNullAndEmptyArrays: true
        }
      },
      { $sort: { _id: -1 } }
    ])

    const accessReleaseInvitations = await this.mongoDB.aggregatePaginate(aggregationStages)

    const accessReleaseInvitation = accessReleaseInvitations.docs[0]

    if (!accessReleaseInvitation) return null

    return new AccessReleaseInvitationModel(accessReleaseInvitation)
  }

  async create (accessReleaseInvitation: AccessReleaseInvitationModel): Promise<AccessReleaseInvitationModel> {
    const document = await this.mongoDB.create(accessReleaseInvitation.object)

    return new AccessReleaseInvitationModel(document)
  }

  async findAllExpiring (): Promise<Array<Partial<IAccessReleaseInvitation>>> {
    const currentDate = DateUtils.getCurrent()

    // add tenantId

    const documents = await this.mongoDB.find({
      deletionDate: null,
      endDate: {
        $lte: currentDate
      },
      active: true,
      status: AccessReleaseInvitationStatus.pending
    }, ['_id', 'tenantId'])

    return documents
  }

  async update ({
    id,
    data,
    tenantId,
    session
  }: IUpdateProps<IAccessReleaseInvitation>): Promise<boolean> {
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

  async list ({ limit, page, ...filters }: IListAccessReleaseInvitationsFilters): Promise<IAggregatePaginate<IAccessReleaseInvitation>> {
    const aggregationStages: Aggregate<Array<any>> = this.mongoDB.aggregate([
      { $match: filters },
      {
        $lookup: {
          from: 'people',
          localField: 'guestId',
          foreignField: '_id',
          as: 'guest'
        }
      },
      {
        $unwind: {
          path: '$guest',
          preserveNullAndEmptyArrays: true
        }
      },

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
