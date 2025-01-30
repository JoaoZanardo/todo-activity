import { Aggregate, FilterQuery } from 'mongoose'

import { IFindModelByIdProps } from '../../core/interfaces/Model'
import { IAggregatePaginate, IUpdateProps } from '../../core/interfaces/Repository'
import { Repository } from '../../core/Repository'
import { AccessReleaseModel, IAccessRelease, IFindAllAccessReleaseByPersonTypeId, IFindLastAccessReleaseByPersonId, IListAccessReleasesFilters } from './AccessReleaseModel'
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

  async findAllExpiringToday (): Promise<Array<Partial<IAccessRelease>>> {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)

    const documents = await this.mongoDB.find({
      deletionDate: null,
      endDate: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      active: true
    }, ['_id', 'tenantId', 'endDate'])

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
          active: true
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
        $unwind: {
          path: '$responsible',
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

  async create (accessRelease: AccessReleaseModel): Promise<AccessReleaseModel> {
    const document = await this.mongoDB.create(accessRelease.object)

    return new AccessReleaseModel(document)
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

  async list ({ limit, page, ...filters }: IListAccessReleasesFilters): Promise<IAggregatePaginate<IAccessRelease>> {
    const aggregationStages: Aggregate<Array<any>> = this.mongoDB.aggregate([
      { $match: filters },
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
          from: 'people',
          localField: 'personId',
          foreignField: '_id',
          as: 'person'
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
          from: 'accesspoints',
          localField: 'accessPointId',
          foreignField: '_id',
          as: 'accessPoint'
        }
      },
      {
        $lookup: {
          from: 'persontypecategories',
          localField: 'personTypeCategoryId',
          foreignField: '_id',
          as: 'personTypeCategory'
        }
      },
      {
        $unwind: {
          path: '$personTypeCategory',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: '$responsible',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: '$personType'
      },
      {
        $unwind: '$accessPoint'
      },
      { $unwind: '$person' },
      {
        $lookup: {
          from: 'areas',
          localField: 'accessPoint.areaId',
          foreignField: '_id',
          as: 'area'
        }
      },
      {
        $lookup: {
          from: 'accessareas',
          localField: 'accessPoint.accessAreaId',
          foreignField: '_id',
          as: 'accessArea'
        }
      },
      { $unwind: '$area' },
      {
        $unwind: {
          path: '$accessArea',
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
