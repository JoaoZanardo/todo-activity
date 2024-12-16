import { IFindModelByIdProps, ModelAction } from '../../core/interfaces/Model'
import { IAggregatePaginate } from '../../core/interfaces/Repository'
import { IDeletePersonTypeFormProps, IFindPersonTypeFormByPersonTypeIdProps, IListPersonTypeFormsFilters, IPersonTypeForm, IUpdatePersonTypeFormProps, PersonTypeFormModel } from '../../models/PersonTypeForm/PersonTypeFormModel'
import { PersonTypeFormRepositoryImp } from '../../models/PersonTypeForm/PersonTypeFormMongoDB'
import CustomResponse from '../../utils/CustomResponse'
import { DateUtils } from '../../utils/Date'

export class PersonTypeFormService {
  constructor (
    private personTypeFormRepositoryImp: typeof PersonTypeFormRepositoryImp
  ) {
    this.personTypeFormRepositoryImp = personTypeFormRepositoryImp
  }

  async list (filters: IListPersonTypeFormsFilters): Promise<IAggregatePaginate<IPersonTypeForm>> {
    return await this.personTypeFormRepositoryImp.list(filters)
  }

  async findById ({
    id,
    tenantId
  }: IFindModelByIdProps): Promise<PersonTypeFormModel> {
    const personTypeForm = await this.personTypeFormRepositoryImp.findById({
      id,
      tenantId
    })

    if (!personTypeForm) throw CustomResponse.NOT_FOUND('Formulário de tipo de pessoa não cadastrado!')

    return personTypeForm
  }

  async findByPersonTypeId ({
    personTypeId,
    tenantId
  }: IFindPersonTypeFormByPersonTypeIdProps): Promise<PersonTypeFormModel> {
    const personTypeForm = await this.personTypeFormRepositoryImp.findByPersonTypeId({
      personTypeId,
      tenantId
    })

    if (!personTypeForm) throw CustomResponse.NOT_FOUND('Formulário de tipo de pessoa não cadastrado!')

    return personTypeForm
  }

  async create (personTypeForm: PersonTypeFormModel): Promise<PersonTypeFormModel> {
    await this.validateDuplicatedForm(personTypeForm)

    return await this.personTypeFormRepositoryImp.create(personTypeForm)
  }

  async update ({
    id,
    tenantId,
    responsibleId,
    data
  }: IUpdatePersonTypeFormProps): Promise<void> {
    const personTypeForm = await this.findById({
      id,
      tenantId
    })

    const updated = await this.personTypeFormRepositoryImp.update({
      id,
      tenantId,
      data: {
        ...data,
        actions: [
          ...personTypeForm.actions!,
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
      throw CustomResponse.INTERNAL_SERVER_ERROR('Ocorreu um erro ao tentar atualizar formulário de tipo de pessoa!', {
        personTypeFormId: id
      })
    }
  }

  async delete ({
    id,
    tenantId,
    responsibleId
  }: IDeletePersonTypeFormProps) {
    const personTypeForm = await this.findById({
      id,
      tenantId
    })

    // await this.validateDeletion(personTypeForm)

    if (personTypeForm.object.deletionDate) {
      throw CustomResponse.CONFLICT('Formulário de tipo de pessoa já removido!', {
        personTypeFormId: id
      })
    }

    return await this.update({
      id,
      tenantId,
      data: {
        active: false,
        deletionDate: DateUtils.getCurrent()
      },
      responsibleId
    })
  }

  private async validateDuplicatedForm ({
    personTypeId,
    tenantId
  }: IFindPersonTypeFormByPersonTypeIdProps): Promise<void> {
    const exists = await this.personTypeFormRepositoryImp.findByPersonTypeId({
      personTypeId,
      tenantId
    })

    if (exists) throw CustomResponse.CONFLICT('Formulário de tipo de pessoa já cadastrado!')
  }
}
