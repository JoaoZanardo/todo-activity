import { ClientSession } from 'mongoose'

import { IFindModelByIdProps, IFindModelByNameProps, ModelAction } from '../../core/interfaces/Model'
import { IAggregatePaginate } from '../../core/interfaces/Repository'
import { IDeletePersonTypeCategoryProps, IFindAllCategoriesByPersonTypeIdProps, IListPersonTypeCategorysFilters, IPersonTypeCategory, IUpdatePersonTypeCategoryProps, PersonTypeCategoryModel } from '../../models/PersonTypeCategory/PersonTypeCategoryModel'
import { PersonTypeCategoryRepositoryImp } from '../../models/PersonTypeCategory/PersonTypeCategoryMongoDB'
import CustomResponse from '../../utils/CustomResponse'
import { DateUtils } from '../../utils/Date'

export class PersonTypeCategoryService {
  constructor (
    private personTypeCategoryRepositoryImp: typeof PersonTypeCategoryRepositoryImp
  ) {
    this.personTypeCategoryRepositoryImp = personTypeCategoryRepositoryImp
  }

  async list (filters: IListPersonTypeCategorysFilters): Promise<IAggregatePaginate<IPersonTypeCategory>> {
    return await this.personTypeCategoryRepositoryImp.list(filters)
  }

  async findAllByPersonTypeId ({
    tenantId,
    select,
    personTypeId
  }: IFindAllCategoriesByPersonTypeIdProps): Promise<Array<Partial<PersonTypeCategoryModel>>> {
    return await this.personTypeCategoryRepositoryImp.findAllByPersonTypeId({
      tenantId,
      select,
      personTypeId
    })
  }

  async findById ({
    id,
    tenantId
  }: IFindModelByIdProps): Promise<PersonTypeCategoryModel> {
    const personTypeCategory = await this.personTypeCategoryRepositoryImp.findById({
      id,
      tenantId
    })
    if (!personTypeCategory) throw CustomResponse.NOT_FOUND('Categoria de tipo de pessoa não cadastrada!')

    return personTypeCategory
  }

  async create (personTypeCategory: PersonTypeCategoryModel, session: ClientSession): Promise<PersonTypeCategoryModel> {
    await this.validateDuplicatedName(personTypeCategory)

    return await this.personTypeCategoryRepositoryImp.create(personTypeCategory, session)
  }

  async update ({
    id,
    tenantId,
    responsibleId,
    data,
    session
  }: IUpdatePersonTypeCategoryProps): Promise<void> {
    const personTypeCategory = await this.findById({
      id,
      tenantId
    })

    const name = data.name

    if (name && name !== personTypeCategory.name) {
      await this.validateDuplicatedName({
        name,
        tenantId
      })
    }

    const updated = await this.personTypeCategoryRepositoryImp.update({
      id,
      tenantId,
      data: {
        ...data,
        actions: [
          ...personTypeCategory.actions!,
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
      },
      session
    })

    if (!updated) {
      throw CustomResponse.INTERNAL_SERVER_ERROR('Ocorreu um erro ao tentar atualizar categoria de tipo de pessoa!', {
        personTypeCategoryId: id
      })
    }
  }

  async delete ({
    id,
    tenantId,
    responsibleId,
    session
  }: IDeletePersonTypeCategoryProps) {
    const personTypeCategory = await this.findById({
      id,
      tenantId
    })

    // Validate if exists person with the current personTypeCategory
    // await this.validateDeletion(personTypeCategory)

    if (personTypeCategory.object.deletionDate) {
      throw CustomResponse.CONFLICT('Categoria de tipo de pessoa já removida!', {
        personTypeCategoryId: id
      })
    }

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
    const personTypeCategory = await this.personTypeCategoryRepositoryImp.findByName({
      name,
      tenantId
    })

    if (personTypeCategory) throw CustomResponse.CONFLICT('Nome de categoria de tipo de pessoa já cadastrado!')
  }

  // private async validateDeletion (personTypeCategory: PersonTypeCategoryModel): Promise<void> {
  //   const peopleFilter = PersonModel.listFilters({
  //     tenantId: personTypeCategory.tenantId,
  //     personTypeCategoryId: personTypeCategory._id
  //   })

  //   const people = await PersonServiceImp.list(peopleFilter)

  //   if (people.docs.length) CustomResponse.CONFLICT('Existem pessoas veínculadas a esse tipo!')
  // }
}
