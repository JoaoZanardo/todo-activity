import { ClientSession } from 'mongoose'
import { AccessPointServiceImp } from 'src/features/AccessPoint/AccessPointController'
import { PersonTypeCategoryServiceImp } from 'src/features/PersonTypeCategory/PersonTypeCategoryController'

import { IFindAllModelsProps, IFindModelByIdProps, IFindModelByNameProps, ModelAction } from '../../core/interfaces/Model'
import { IAggregatePaginate } from '../../core/interfaces/Repository'
import { IDeletePersonTypeProps, IListPersonTypesFilters, IPersonType, IUpdatePersonTypeProps, PersonTypeModel } from '../../models/PersonType/PersonTypeModel'
import { PersonTypeRepositoryImp } from '../../models/PersonType/PersonTypeMongoDB'
import { PersonTypeFormModel } from '../../models/PersonTypeForm/PersonTypeFormModel'
import CustomResponse from '../../utils/CustomResponse'
import { DateUtils } from '../../utils/Date'
import { PersonServiceImp } from '../Person/PersonController'
import { PersonTypeFormServiceImp } from '../PersonTypeForm/PersonTypeFormController'

export class PersonTypeService {
  constructor (
    private personTypeRepositoryImp: typeof PersonTypeRepositoryImp
  ) {
    this.personTypeRepositoryImp = personTypeRepositoryImp
  }

  async list (filters: IListPersonTypesFilters): Promise<IAggregatePaginate<IPersonType>> {
    return await this.personTypeRepositoryImp.list(filters)
  }

  async findAll ({
    tenantId,
    select
  }: IFindAllModelsProps): Promise<Array<Partial<IPersonType>>> {
    return await this.personTypeRepositoryImp.findAll({
      tenantId,
      select
    })
  }

  async findById ({
    id,
    tenantId
  }: IFindModelByIdProps): Promise<PersonTypeModel> {
    const personType = await this.personTypeRepositoryImp.findById({
      id,
      tenantId
    })

    if (!personType) throw CustomResponse.NOT_FOUND('Tipo de pessoa não cadastrado!')

    return personType
  }

  async create (personType: PersonTypeModel, session: ClientSession): Promise<PersonTypeModel> {
    await this.validateDuplicatedName(personType)

    const createdPersonType = await this.personTypeRepositoryImp.create(personType, session)

    const personTypeForModel = new PersonTypeFormModel({
      fields: [],
      personTypeId: createdPersonType._id!,
      tenantId: createdPersonType.tenantId,
      actions: [{
        action: ModelAction.create,
        date: DateUtils.getCurrent()
      }]
    })

    await PersonTypeFormServiceImp.create(personTypeForModel, session)

    return createdPersonType
  }

  async update ({
    id,
    tenantId,
    responsibleId,
    data,
    session
  }: IUpdatePersonTypeProps): Promise<void> {
    const personType = await this.findById({
      id,
      tenantId
    })

    const name = data.name

    if (name && name !== personType.name) {
      await this.validateDuplicatedName({
        name,
        tenantId
      })
    }

    const updated = await this.personTypeRepositoryImp.update({
      id,
      tenantId,
      session,
      data: {
        ...data,
        actions: [
          ...personType.actions!,
          (
            data.deletionDate ? {
              action: ModelAction.delete,
              date: DateUtils.getCurrent(),
              userId: responsibleId
            } : {
              action: ModelAction.update,
              date: DateUtils.getCurrent(),
              userId: responsibleId
            }
          )
        ]
      }
    })

    if (!updated) {
      throw CustomResponse.INTERNAL_SERVER_ERROR('Ocorreu um erro ao tentar atualizar tipo de pessoa!', {
        personTypeId: id
      })
    }
  }

  async delete ({
    id,
    tenantId,
    responsibleId,
    session
  }: IDeletePersonTypeProps) {
    const personType = await this.findById({
      id,
      tenantId
    })

    // Validate if exists person with the current personType
    // Delete all PersontypeForms
    await this.validateDeletion(personType)

    if (personType.object.deletionDate) {
      throw CustomResponse.CONFLICT('Tipo de pessoa já removido!', {
        personTypeId: id
      })
    }

    await this.deleteAllLinkedModels({
      id,
      responsibleId,
      tenantId,
      session
    })

    return await this.update({
      id,
      tenantId,
      data: {
        active: false,
        deletionDate: DateUtils.getCurrent()
      },
      responsibleId,
      session
    })
  }

  private async validateDuplicatedName ({
    name,
    tenantId
  }: IFindModelByNameProps): Promise<void> {
    const personType = await this.personTypeRepositoryImp.findByName({
      name,
      tenantId
    })

    if (personType) throw CustomResponse.CONFLICT('Nome de tipo de pessoa já cadastrado!')
  }

  private async deleteAllLinkedModels ({
    id,
    responsibleId,
    tenantId,
    session
  }: IDeletePersonTypeProps): Promise<void> {
    const personTypeForm = await PersonTypeFormServiceImp.findByPersonTypeId({
      personTypeId: id,
      tenantId
    })

    await PersonTypeFormServiceImp.delete({
      id: personTypeForm._id!,
      responsibleId,
      tenantId,
      session
    })

    const personTypeCategories = await PersonTypeCategoryServiceImp.findAllByPersonTypeId({
      personTypeId: id,
      tenantId,
      select: ['_id']
    })

    if (personTypeCategories.length) {
      await Promise.all(
        personTypeCategories.map(async personTypeCategory => {
          await PersonTypeCategoryServiceImp.delete({
            id: personTypeCategory._id!,
            responsibleId,
            tenantId,
            session
          })
        })
      )
    }
  }

  private async validateDeletion (personType: PersonTypeModel): Promise<void> {
    const personTypeId = personType._id!
    const tenantId = personType.tenantId

    const accesspoints = await AccessPointServiceImp.findAllByPersonTypeId({
      personTypeId,
      tenantId
    })

    if (accesspoints.length) CustomResponse.CONFLICT('Existem pontos de acessos veínculados a esse tipo de pessoa!')

    const people = await PersonServiceImp.findAllByPersonTypeId({
      personTypeId,
      tenantId
    })

    if (people.length) CustomResponse.CONFLICT('Existem pessoas veínculadas a esse tipo de pessoa!')
  }
}
