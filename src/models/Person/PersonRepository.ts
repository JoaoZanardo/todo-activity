import { Aggregate, ClientSession, FilterQuery } from 'mongoose'

import { IFindModelByIdProps, IFindModelByNameProps } from '../../core/interfaces/Model'
import { IAggregatePaginate, IUpdateProps } from '../../core/interfaces/Repository'
import { Repository } from '../../core/Repository'
import { DateUtils } from '../../utils/Date'
import { IFindAllByPersonTypeId, IFindPersonByCnhProps, IFindPersonByCpfProps, IListPersonsFilters, IPerson, PersonModel } from './PersonModel'
import { IPersonMongoDB } from './PersonSchema'

export class PersonRepository extends Repository<IPersonMongoDB, PersonModel> {
  async findById ({
    id,
    tenantId
  }: IFindModelByIdProps): Promise<PersonModel | null> {
    const aggregationStages: Aggregate<Array<any>> = this.mongoDB.aggregate([
      {
        $match: {
          _id: id,
          tenantId,
          deletionDate: null
        }
      },
      ...this.$lookupAndUnwindStages(true),
      { $sort: { _id: -1 } }
    ])

    const people = await this.mongoDB.aggregatePaginate(aggregationStages)

    const person = people.docs[0]

    if (!person) return null

    return new PersonModel(person)
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

  async findByCpf ({
    cpf,
    tenantId
  }: IFindPersonByCpfProps): Promise<PersonModel | null> {
    const match: FilterQuery<IPerson> = {
      cpf,
      tenantId,
      deletionDate: null
    }

    const doc = await this.mongoDB.findOne(match).lean()
    if (!doc) return null

    return new PersonModel(doc)
  }

  async findByCnh ({
    cnh,
    tenantId
  }: IFindPersonByCnhProps): Promise<PersonModel | null> {
    const match: FilterQuery<IPerson> = {
      'cnh.value': cnh,
      tenantId,
      deletionDate: null
    }

    const doc = await this.mongoDB.findOne(match).lean()
    if (!doc) return null

    return new PersonModel(doc)
  }

  async findAllByPersonTypeId ({
    personTypeId,
    tenantId
  }: IFindAllByPersonTypeId): Promise<Array<Partial<IPerson>>> {
    const documents = await this.mongoDB.find({
      personTypeId,
      tenantId,
      deletionDate: null
    }, ['_id'])

    return documents
  }

  async findAllExpired (): Promise<Array<Partial<IPerson>>> {
    const currentDate = DateUtils.getCurrent()

    // Add storaged TenantId

    const documents = await this.mongoDB.find({
      'updationInfo.updatedData': true,
      'updationInfo.nextUpdationdate': {
        $le: currentDate
      },
      deletionDate: null
    }, ['_id', 'tenantId'])

    return documents
  }

  async create (person: PersonModel, session: ClientSession): Promise<PersonModel> {
    const document = await this.mongoDB.create([person.object], {
      session
    })

    return new PersonModel(document[0])
  }

  async update ({
    id,
    data,
    tenantId,
    session
  }: IUpdateProps<IPerson>): Promise<boolean> {
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

  async list ({ limit, page, lastAccess, ...filters }: IListPersonsFilters): Promise<IAggregatePaginate<IPerson>> {
    const aggregationStages: Aggregate<Array<any>> = this.mongoDB.aggregate([
      { $match: filters },
      ...(lastAccess ? [{ $limit: 2 }] : []),
      ...this.$lookupAndUnwindStages(lastAccess),
      { $sort: { _id: -1 } }
    ])

    return await this.mongoDB.aggregatePaginate(aggregationStages, { limit, page })
  }

  private $lookupAndUnwindStages (lastAccess?: boolean): Array<any> {
    const lastAccessStages = [

      {
        $lookup: {
          from: 'accesscontrols',
          localField: '_id',
          foreignField: 'person.id',
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
      }
    ]

    const baseStages = [
      {
        $lookup: {
          from: 'persontypes',
          localField: 'personTypeId',
          foreignField: '_id',
          as: 'personType'
        }
      },
      { $unwind: '$personType' }
    ]

    return lastAccess ? [...baseStages, ...lastAccessStages] : baseStages
  }
}
