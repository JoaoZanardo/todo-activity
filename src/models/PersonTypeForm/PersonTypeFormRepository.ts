import { Aggregate, FilterQuery } from 'mongoose'

import { IFindModelByIdProps } from '../../core/interfaces/Model'
import { IAggregatePaginate, IUpdateProps } from '../../core/interfaces/Repository'
import { Repository } from '../../core/Repository'
import { IFindPersonTypeFormByPersonTypeIdProps, IListPersonTypeFormsFilters, IPersonTypeForm, PersonTypeFormModel } from './PersonTypeFormModel'
import { IPersonTypeFormMongoDB } from './PersonTypeFormSchema'

export class PersonTypeFormRepository extends Repository<IPersonTypeFormMongoDB, PersonTypeFormModel> {
  async findById ({
    id,
    tenantId
  }: IFindModelByIdProps): Promise<PersonTypeFormModel | null> {
    const match: FilterQuery<IPersonTypeForm> = {
      _id: id,
      tenantId,
      deletionDate: null
    }

    const document = await this.mongoDB.findOne(match).lean()
    if (!document) return null

    return new PersonTypeFormModel(document)
  }

  async findByPersonTypeId ({
    personTypeId,
    tenantId
  }: IFindPersonTypeFormByPersonTypeIdProps): Promise<PersonTypeFormModel | null> {
    const match: FilterQuery<IPersonTypeForm> = {
      personTypeId,
      tenantId,
      deletionDate: null
    }

    const document = await this.mongoDB.findOne(match).lean()
    if (!document) return null

    return new PersonTypeFormModel(document)
  }

  async create (personTypeForm: PersonTypeFormModel): Promise<PersonTypeFormModel> {
    const document = await this.mongoDB.create(personTypeForm.object)

    return new PersonTypeFormModel(document)
  }

  async update ({
    id,
    data,
    tenantId
  }: IUpdateProps<IPersonTypeForm>): Promise<boolean> {
    const updated = await this.mongoDB.updateOne({
      _id: id,
      tenantId
    }, {
      $set: data
    })

    return !!updated.modifiedCount
  }

  async list ({ limit, page, ...filters }: IListPersonTypeFormsFilters): Promise<IAggregatePaginate<IPersonTypeForm>> {
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
