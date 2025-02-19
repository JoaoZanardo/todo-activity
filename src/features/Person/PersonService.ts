import { IFindModelByIdProps, ModelAction } from '../../core/interfaces/Model'
import { AccessReleaseStatus } from '../../models/AccessRelease/AccessReleaseModel'
import { IDeletePersonProps, IFindAllByPersonTypeId, IFindPersonByCpfProps, IListPersonsFilters, IPerson, IUpdatePersonProps, PersonModel } from '../../models/Person/PersonModel'
import { PersonRepositoryImp } from '../../models/Person/PersonMongoDB'
import CustomResponse from '../../utils/CustomResponse'
import { DateUtils } from '../../utils/Date'
import { AccessReleaseServiceImp } from '../AccessRelease/AccessReleaseController'

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

  async findByCpf ({
    cpf,
    tenantId
  }: IFindPersonByCpfProps): Promise<PersonModel> {
    const person = await this.personRepositoryImp.findByCpf({
      cpf,
      tenantId
    })

    if (!person) throw CustomResponse.NOT_FOUND('Pessoa não cadastrada!')

    return person
  }

  async findAllByPersonTypeId ({
    personTypeId,
    tenantId
  }: IFindAllByPersonTypeId): Promise<Array<Partial<IPerson>>> {
    return await this.personRepositoryImp.findAllByPersonTypeId({
      personTypeId,
      tenantId
    })
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
    data,
    session
  }: IUpdatePersonProps): Promise<void> {
    const person = await this.findById({
      id,
      tenantId
    })

    if (data.active === false) {
      const accessRelease = await AccessReleaseServiceImp.findLastByPersonId({
        personId: id,
        tenantId
      })

      if (accessRelease) {
        await AccessReleaseServiceImp.disable({
          id: accessRelease._id!,
          tenantId,
          status: AccessReleaseStatus.disabled
        })
      }
    }

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
      },
      session
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

    // await this.validateDeletion(person, responsibleId)

    if (person.object.deletionDate) {
      throw CustomResponse.CONFLICT('Pessoa já removida!', {
        personId: id
      })
    }

    const accessRelease = await AccessReleaseServiceImp.findLastByPersonId({
      personId: id,
      tenantId
    })

    if (accessRelease) {
      await AccessReleaseServiceImp.disable({
        id: accessRelease._id!,
        tenantId,
        status: AccessReleaseStatus.disabled
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
