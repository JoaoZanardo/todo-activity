import { Aggregate, FilterQuery } from 'mongoose'

import { IFindModelByIdProps, IFindModelByNameProps } from '../../core/interfaces/Model'
import { IAggregatePaginate, IUpdateProps } from '../../core/interfaces/Repository'
import { Repository } from '../../core/Repository'
import { IListPersonTypesFilters, IPersonType, PersonTypeModel } from './PersonTypeModel'
import { IPersonTypeMongoDB } from './PersonTypeSchema'

export class PersonTypeRepository extends Repository<IPersonTypeMongoDB, PersonTypeModel> {
  async findById ({
    id,
    tenantId
  }: IFindModelByIdProps): Promise<PersonTypeModel | null> {
    const match: FilterQuery<IPersonType> = {
      _id: id,
      tenantId,
      deletionDate: null
    }

    const document = await this.mongoDB.findOne(match).lean()
    if (!document) return null

    return new PersonTypeModel(document)
  }

  async findByName ({
    name,
    tenantId
  }: IFindModelByNameProps): Promise<PersonTypeModel | null> {
    const match: FilterQuery<IPersonType> = {
      name,
      tenantId,
      deletionDate: null
    }

    const document = await this.mongoDB.findOne(match).lean()
    if (!document) return null

    return new PersonTypeModel(document)
  }

  async create (personType: PersonTypeModel): Promise<PersonTypeModel> {
    const document = await this.mongoDB.create(personType.object)

    return new PersonTypeModel(document)
  }

  async update ({
    id,
    data,
    tenantId
  }: IUpdateProps<IPersonType>): Promise<boolean> {
    const updated = await this.mongoDB.updateOne({
      _id: id,
      tenantId
    }, {
      $set: data
    })

    return !!updated.modifiedCount
  }

  async list ({ limit, page, ...filters }: IListPersonTypesFilters): Promise<IAggregatePaginate<IPersonType>> {
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
