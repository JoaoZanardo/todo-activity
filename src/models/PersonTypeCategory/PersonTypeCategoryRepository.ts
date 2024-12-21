import { Aggregate, ClientSession, FilterQuery } from 'mongoose'

import { IFindModelByIdProps, IFindModelByNameProps } from '../../core/interfaces/Model'
import { IAggregatePaginate, IUpdateProps } from '../../core/interfaces/Repository'
import { Repository } from '../../core/Repository'
import { IFindAllCategoriesByPersonTypeIdProps, IListPersonTypeCategorysFilters, IPersonTypeCategory, PersonTypeCategoryModel } from './PersonTypeCategoryModel'
import { IPersonTypeCategoryMongoDB } from './PersonTypeCategorySchema'

export class PersonTypeCategoryRepository extends Repository<IPersonTypeCategoryMongoDB, PersonTypeCategoryModel> {
  async findById ({
    id,
    tenantId
  }: IFindModelByIdProps): Promise<PersonTypeCategoryModel | null> {
    const match: FilterQuery<IPersonTypeCategory> = {
      _id: id,
      tenantId,
      deletionDate: null
    }

    const document = await this.mongoDB.findOne(match).lean()
    if (!document) return null

    return new PersonTypeCategoryModel(document)
  }

  async findByName ({
    name,
    tenantId
  }: IFindModelByNameProps): Promise<PersonTypeCategoryModel | null> {
    const match: FilterQuery<IPersonTypeCategory> = {
      name,
      tenantId,
      deletionDate: null
    }

    const document = await this.mongoDB.findOne(match).lean()
    if (!document) return null

    return new PersonTypeCategoryModel(document)
  }

  async findAllByPersonTypeId ({
    tenantId,
    select,
    personTypeId
  }: IFindAllCategoriesByPersonTypeIdProps): Promise<Array<Partial<PersonTypeCategoryModel>>> {
    return await this.mongoDB.find({
      tenantId,
      personTypeId,
      deletionDate: null
    }, select)
  }

  async create (personTypeCategory: PersonTypeCategoryModel, session: ClientSession): Promise<PersonTypeCategoryModel> {
    const document = await this.mongoDB.create([personTypeCategory.object], {
      session
    })

    return new PersonTypeCategoryModel(document[0])
  }

  async update ({
    id,
    data,
    tenantId
  }: IUpdateProps<IPersonTypeCategory>): Promise<boolean> {
    const updated = await this.mongoDB.updateOne({
      _id: id,
      tenantId
    }, {
      $set: data
    })

    return !!updated.modifiedCount
  }

  async list ({ limit, page, ...filters }: IListPersonTypeCategorysFilters): Promise<IAggregatePaginate<IPersonTypeCategory>> {
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
