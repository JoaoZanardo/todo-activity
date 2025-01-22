import { Aggregate, FilterQuery } from 'mongoose'

import { IFindModelByIdProps, IFindModelByNameProps } from '../../core/interfaces/Model'
import { IAggregatePaginate, IUpdateProps } from '../../core/interfaces/Repository'
import { Repository } from '../../core/Repository'
import { IFindPersonByDocumentProps, IListPersonsFilters, IPerson, PersonModel } from './PersonModel'
import { IPersonMongoDB } from './PersonSchema'

export class PersonRepository extends Repository<IPersonMongoDB, PersonModel> {
  async findById ({
    id,
    tenantId

  }: IFindModelByIdProps): Promise<PersonModel | null> {
    const match: FilterQuery<IPerson> = {
      _id: id,
      tenantId,
      deletionDate: null
    }

    const document = await this.mongoDB.findOne(match).lean()
    if (!document) return null

    return new PersonModel(document)
  }

  async findByName ({
    name,
    tenantId
  }: IFindModelByNameProps): Promise<PersonModel | null> {
    const match: FilterQuery<IPerson> = {
      name,
      tenantId,
      deletionDate: null
    }

    const document = await this.mongoDB.findOne(match).lean()
    if (!document) return null

    return new PersonModel(document)
  }

  async findByDocument ({
    document,
    tenantId
  }: IFindPersonByDocumentProps): Promise<PersonModel | null> {
    const match: FilterQuery<IPerson> = {
      document,
      tenantId,
      deletionDate: null
    }

    const doc = await this.mongoDB.findOne(match).lean()
    if (!doc) return null

    return new PersonModel(doc)
  }

  async create (person: PersonModel): Promise<PersonModel> {
    const document = await this.mongoDB.create(person.object)

    return new PersonModel(document)
  }

  async update ({
    id,
    data,
    tenantId
  }: IUpdateProps<IPerson>): Promise<boolean> {
    const updated = await this.mongoDB.updateOne({
      _id: id,
      tenantId
    }, {
      $set: data
    })

    return !!updated.modifiedCount
  }

  async list ({ limit, page, ...filters }: IListPersonsFilters): Promise<IAggregatePaginate<IPerson>> {
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
          from: 'persontypecategories',
          localField: 'personTypeCategoryId',
          foreignField: '_id',
          as: 'personTypeCategory'
        }
      },
      {
        $lookup: {
          from: 'accesscontrols',
          localField: '_id',
          foreignField: 'personId',
          as: 'lastAccessControl'
        }
      },
      {
        $set: {
          lastAccessControl: {
            $arrayElemAt: [
              {
                $sortArray: { input: '$lastAccessControl', sortBy: { _id: -1 } }
              },
              0
            ]
          }
        }
      },
      // Caso sejam necessários mesmo que seja array com único elemento
      { $unwind: '$personType' },
      {
        $unwind: {
          path: '$personTypeCategory',
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
