import { Aggregate, FilterQuery } from 'mongoose'

import { IFindModelByIdProps } from '../../core/interfaces/Model'
import { IAggregatePaginate, IUpdateProps } from '../../core/interfaces/Repository'
import { Repository } from '../../core/Repository'
import { IListPersonsFilters, IPerson, PersonModel } from './PersonModel'
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
