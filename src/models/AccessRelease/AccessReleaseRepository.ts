import { Aggregate, ClientSession, FilterQuery } from 'mongoose'

import { IFindModelByIdProps } from '../../core/interfaces/Model'
import { IAggregatePaginate, IUpdateProps } from '../../core/interfaces/Repository'
import { Repository } from '../../core/Repository'
import { DateUtils } from '../../utils/Date'
import { AccessReleaseModel, AccessReleaseStatus, IAccessRelease, IFindAccessReleaseByAccessReleaseInvitationId, IFindAllAccessReleaseByPersonTypeId, IFindAllAccessReleaseByResponsibleId, IFindLastAccessReleaseByPersonId, IListAccessReleasesFilters, IUpdateAccessReleaseSynchronizationsProps } from './AccessReleaseModel'
import { IAccessReleaseMongoDB } from './AccessReleaseSchema'

export class AccessReleaseRepository extends Repository<IAccessReleaseMongoDB, AccessReleaseModel> {
  async findById ({
    id,
    tenantId
  }: IFindModelByIdProps): Promise<AccessReleaseModel | null> {
    const match: FilterQuery<IAccessRelease> = {
      _id: id,
      tenantId,
      deletionDate: null
    }

    const document = await this.mongoDB.findOne(match).lean()
    if (!document) return null

    return new AccessReleaseModel(document)
  }

  async findByAccessReleaseInvitationId ({
    accessReleaseInvitationId,
    tenantId
  }: IFindAccessReleaseByAccessReleaseInvitationId): Promise<AccessReleaseModel | null> {
    const match: FilterQuery<IAccessRelease> = {
      accessReleaseInvitationId,
      tenantId,
      deletionDate: null
    }

    const document = await this.mongoDB.findOne(match).lean()
    if (!document) return null

    return new AccessReleaseModel(document)
  }

  async findAllExpiringToday (): Promise<Array<Partial<IAccessRelease>>> {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)

    const documents = await this.mongoDB.find({
      deletionDate: null,
      endDate: {
        $lte: endOfDay
      },
      active: true,
      status: AccessReleaseStatus.active
    }, ['_id', 'tenantId', 'endDate'])

    return documents
  }

  async findAllActiveExpiredAccessReleases (): Promise<Array<Partial<IAccessRelease>>> {
    const minEndDate = DateUtils.getCurrent()
    minEndDate.setMinutes(minEndDate.getMinutes() - 1)

    const documents = await this.mongoDB.find({
      deletionDate: null,
      endDate: {
        $lte: minEndDate
      },
      active: true,
      status: AccessReleaseStatus.active
    }, ['_id', 'tenantId', 'endDate'])

    return documents
  }

  async findAllScheduledAccessReleasesThatStarted (): Promise<Array<Partial<IAccessRelease>>> {
    const minEndDate = DateUtils.getCurrent()
    minEndDate.setMinutes(minEndDate.getMinutes() - 1)

    const documents = await this.mongoDB.find({
      deletionDate: null,
      initDate: {
        $lte: minEndDate
      },
      active: true,
      status: AccessReleaseStatus.scheduled
    }, ['_id', 'tenantId', 'initDate', 'endDate', 'areasIds', 'personId', 'actions', 'finalAreaId'])

    return documents
  }

  async findAllStartingToday (): Promise<Array<Partial<IAccessRelease>>> {
    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)

    const documents = await this.mongoDB.find({
      deletionDate: null,
      initDate: {
        $lte: endOfDay
      },
      active: true,
      status: AccessReleaseStatus.scheduled
    }, ['_id', 'tenantId', 'initDate', 'endDate', 'areasIds', 'personId', 'actions'])

    return documents
  }

  async findAllByPersonTypeId ({
    personTypeId,
    tenantId
  }: IFindAllAccessReleaseByPersonTypeId): Promise<Array<Partial<IAccessRelease>>> {
    const aggregationStages: Aggregate<Array<any>> = this.mongoDB.aggregate([
      {
        $match: {
          personTypeId,
          tenantId,
          deletionDate: null,
          active: true,
          status: AccessReleaseStatus.active
        }
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
          from: 'persontypes',
          localField: 'person.personTypeId',
          foreignField: '_id',
          as: 'person.personType'
        }
      },
      {
        $unwind: '$person.personType'
      },
      // {
      //   $project
      // }
      { $sort: { _id: -1 } }
    ])

    const documents = await this.mongoDB.aggregatePaginate(aggregationStages, {
      limit: 5000
    })

    return documents.docs
  }

  async findAllByResponsibleId ({
    responsibleId,
    tenantId
  }: IFindAllAccessReleaseByResponsibleId): Promise<Array<Partial<IAccessRelease>>> {
    const aggregationStages: Aggregate<Array<any>> = this.mongoDB.aggregate([
      {
        $match: {
          responsibleId,
          tenantId,
          deletionDate: null
        }
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
      { $sort: { _id: -1 } }
    ])

    const documents = await this.mongoDB.aggregatePaginate(aggregationStages, {
      limit: 5000
    })

    return documents.docs
  }

  async findLastByPersonId ({
    personId,
    tenantId
  }: IFindLastAccessReleaseByPersonId): Promise<AccessReleaseModel | null> {
    const aggregationStages: Aggregate<Array<any>> = this.mongoDB.aggregate([
      {
        $match: {
          personId,
          tenantId,
          deletionDate: null
        }
      },
      {
        $lookup: {
          from: 'people',
          localField: 'responsibleId',
          foreignField: '_id',
          as: 'responsible'
        }
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
        $lookup: {
          from: 'persontypes',
          localField: 'personTypeId',
          foreignField: '_id',
          as: 'personType'
        }
      },
      {
        $lookup: {
          from: 'persontypescategories',
          localField: 'personTypeCategoryId',
          foreignField: '_id',
          as: 'personTypeCategory'
        }
      },
      {
        $lookup: {
          from: 'accesspoints',
          localField: 'accessPointId',
          foreignField: '_id',
          as: 'accessPoint'
        }
      },
      {
        $unwind: {
          path: '$responsible',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: '$personTypeCategory',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: '$person'
      },
      {
        $unwind: '$personType'
      },
      {
        $unwind: {
          path: '$accessPoint',
          preserveNullAndEmptyArrays: true
        }
      },
      { $sort: { _id: -1 } }
    ])

    const documents = await this.mongoDB.aggregatePaginate(aggregationStages)

    const accessRelease = documents.docs[0]

    if (!accessRelease) return null

    return new AccessReleaseModel(accessRelease)
  }

  async create (accessRelease: AccessReleaseModel, session: ClientSession): Promise<AccessReleaseModel> {
    const document = await this.mongoDB.create([accessRelease.object], {
      session
    })

    return new AccessReleaseModel(document[0])
  }

  async update ({
    id,
    data,
    tenantId
  }: IUpdateProps<IAccessRelease>): Promise<boolean> {
    const updated = await this.mongoDB.updateOne({
      _id: id,
      tenantId
    }, {
      $set: data
    })

    return !!updated.modifiedCount
  }

  async updateSynchronizations ({
    id,
    synchronization,
    tenantId
  }: IUpdateAccessReleaseSynchronizationsProps): Promise<boolean> {
    const updated = await this.mongoDB.updateOne({
      _id: id,
      tenantId
    }, {
      $push: {
        synchronizations: synchronization
      }
    })

    return !!updated.modifiedCount
  }

  async list ({ limit, page, ...filters }: IListAccessReleasesFilters): Promise<IAggregatePaginate<IAccessRelease>> {
    const aggregationStages: Aggregate<Array<any>> = this.mongoDB.aggregate([
      { $match: filters },
      {
        $lookup: {
          from: 'people',
          localField: 'personId',
          foreignField: '_id',
          as: 'person'
        }
      },
      { $unwind: '$person' },
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
