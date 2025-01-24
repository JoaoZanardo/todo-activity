import { IFindModelByIdProps, ModelAction } from '../../core/interfaces/Model'
import { IDeletePersonProps, IFindPersonByCpfProps, IListPersonsFilters, IUpdatePersonProps, PersonModel } from '../../models/Person/PersonModel'
import { PersonRepositoryImp } from '../../models/Person/PersonMongoDB'
import CustomResponse from '../../utils/CustomResponse'
import { DateUtils } from '../../utils/Date'

export class PersonService {
  constructor (
    private personRepositoryImp: typeof PersonRepositoryImp
  ) {
    this.personRepositoryImp = personRepositoryImp
  }

  async findById ({
    id,
    tenantId
  }: IFindModelByIdProps): Promise<PersonModel> {
    const person = await this.personRepositoryImp.findById({
      id,
      tenantId
    })

    if (!person) throw CustomResponse.NOT_FOUND('Pessoa não cadastrada!')

    return person
  }

  async list (filters: IListPersonsFilters) {
    return await this.personRepositoryImp.list(filters)
  }

  async create (person: PersonModel): Promise<PersonModel> {
    // await Promise.all([
    //   this.validateDuplicatedName(person)
    // ])

    if (person.cpf) {
      await this.validateDuplicatedCpf({
        cpf: person.cpf,
        tenantId: person.tenantId
      })
    }

    return await this.personRepositoryImp.create(person)
  }

  async update ({
    id,
    tenantId,
    responsibleId,
    data
  }: IUpdatePersonProps): Promise<void> {
    const person = await this.findById({
      id,
      tenantId
    })

    // const { name } = data

    // if (name && name !== person.name) {
    //   await this.validateDuplicatedName({
    //     name,
    //     tenantId
    //   })
    // }

    const updated = await this.personRepositoryImp.update({
      id,
      tenantId,
      data: {
        ...data,
        actions: [
          ...person.actions!,
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
      throw CustomResponse.INTERNAL_SERVER_ERROR('Ocorreu um erro ao tentar atualizar pessoa!', {
        personId: id
      })
    }
  }

  async delete ({
    id,
    tenantId,
    responsibleId
  }: IDeletePersonProps) {
    const person = await this.findById({
      id,
      tenantId
    })

    // await this.validateDeletion(person)

    if (person.object.deletionDate) {
      throw CustomResponse.CONFLICT('Pessoa já removida!', {
        personId: id
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

  private async validateDuplicatedCpf ({
    cpf,
    tenantId
  }: IFindPersonByCpfProps): Promise<void> {
    const person = await this.personRepositoryImp.findByCpf({
      cpf,
      tenantId
    })

    if (person) throw CustomResponse.CONFLICT('Pessoa já cadastrada!')
  }
}
