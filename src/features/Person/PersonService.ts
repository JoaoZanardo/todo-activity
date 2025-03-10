import { ClientSession, Types } from 'mongoose'

import { IFindModelByIdProps, ModelAction } from '../../core/interfaces/Model'
import { AccessReleaseStatus } from '../../models/AccessRelease/AccessReleaseModel'
import { IArea } from '../../models/Area/AreaModel'
import { IDeletePersonProps, IFindAllByPersonTypeId, IFindPersonByCnhProps, IFindPersonByCpfProps, IFindPersonByEmailProps, IFindPersonByPhoneProps, IListPersonsFilters, IPerson, IUpdatePersonProps, PersonModel } from '../../models/Person/PersonModel'
import { PersonRepositoryImp } from '../../models/Person/PersonMongoDB'
import { addExpiringTime } from '../../utils/addExpiringTime'
import CustomResponse from '../../utils/CustomResponse'
import { DateUtils } from '../../utils/Date'
import { AccessReleaseServiceImp } from '../AccessRelease/AccessReleaseController'
import { AreaServiceImp } from '../Area/AreaController'
import { PersonTypeServiceImp } from '../PersonType/PersonTypeController'

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

  async findOneByIdWithNoTenantId (id: Types.ObjectId): Promise<PersonModel> {
    const person = await this.personRepositoryImp.findfindOneByIdWithNoTenantIdById(id)

    if (!person) throw CustomResponse.NOT_FOUND('Pessoa não cadastrada!')

    return person
  }

  async findAllBondAreas ({
    id,
    tenantId
  }: IFindModelByIdProps): Promise<Array<IArea>> {
    const person = await this.findById({
      id,
      tenantId
    })

    const bondAreasIds = person.object.bondAreasIds

    if (!bondAreasIds?.length) return []

    const bondAreas = await Promise.all(
      bondAreasIds.map(async bondAreadId => {
        const bondArea = await AreaServiceImp.findById({
          id: bondAreadId,
          tenantId
        })

        return bondArea.object
      })
    )

    return bondAreas
  }

  async findAllGuests ({
    id,
    tenantId
  }: IFindModelByIdProps): Promise<Array<IPerson>> {
    const accessReleases = await AccessReleaseServiceImp.findAllByResponsibleId({
      responsibleId: id,
      tenantId
    })

    const guests: Array<IPerson> = []
    const uniqueCpfs = new Set<string>()

    accessReleases.forEach(accessRelease => {
      const person = accessRelease.person!

      if (!uniqueCpfs.has(person.cpf!)) {
        uniqueCpfs.add(person.cpf!)
        guests.push(person)
      }
    })

    return guests
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

  async create (person: PersonModel, session: ClientSession): Promise<PersonModel> {
    const tenantId = person.tenantId

    const personType = await PersonTypeServiceImp.findById({
      id: person.personTypeId,
      tenantId
    })

    const updationTime = personType.object.updationTime

    const currentdate = DateUtils.getCurrent()

    if (updationTime) {
      person.updationInfo = {
        updatedData: true,
        lastUpdationdate: currentdate,
        nextUpdationdate: addExpiringTime(updationTime, currentdate),
        updationTime
      }
    }

    const {
      cnh,
      email,
      phone
    } = person.object

    if (person.cpf) {
      this.validateDuplicatedCpf({
        cpf: person.cpf,
        tenantId
      })
    }

    if (cnh?.value) {
      await this.validateDuplicatedCnh({
        cnh: cnh.value,
        tenantId
      })
    }

    if (email) {
      await this.validateDuplicatedEmail({
        email,
        tenantId
      })
    }

    if (phone) {
      await this.validateDuplicatedPhone({
        phone,
        tenantId
      })
    }

    return await this.personRepositoryImp.create(person, session)
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

    if (data.cpf) {
      // eslint-disable-next-line no-irregular-whitespace
      data.cpf = data.cpf.replace(/\D/g, '')
    }

    const {
      email,
      phone,
      cpf,
      cnh
    } = data

    if (email && email !== person.object.email) {
      await this.validateDuplicatedEmail({
        email,
        tenantId
      })
    }

    if (phone && phone !== person.object.phone) {
      await this.validateDuplicatedPhone({
        phone,
        tenantId
      })
    }

    if (cnh && cnh.value !== person.object.cnh?.value) {
      await this.validateDuplicatedCnh({
        cnh: cnh.value,
        tenantId
      })
    }

    if (cpf && cpf !== person.object.cpf) {
      await this.validateDuplicatedCpf({
        cpf,
        tenantId
      })
    }

    if (data.active === false) {
      const accessRelease = await AccessReleaseServiceImp.findLastByPersonId({
        personId: id,
        tenantId
      })

      if (accessRelease) {
        await AccessReleaseServiceImp.disable({
          id: accessRelease._id!,
          tenantId,
          status: AccessReleaseStatus.disabled,
          session
        })
      }
    }

    const currentdate = DateUtils.getCurrent()

    const updationTime = person.updationInfo?.updationTime

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
        ],
        updationInfo: updationTime ? {
          updatedData: true,
          lastUpdationdate: currentdate,
          nextUpdationdate: addExpiringTime(updationTime, currentdate),
          updationTime
        } : undefined
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
    responsibleId,
    session
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
        status: AccessReleaseStatus.disabled,
        session
      })
    }

    return await this.update({
      id,
      tenantId,
      data: {
        active: false,
        deletionDate: DateUtils.getCurrent(),
        appAccess: false
      },
      responsibleId,
      session
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

  private async validateDuplicatedCnh ({
    cnh,
    tenantId
  }: IFindPersonByCnhProps): Promise<void> {
    const person = await this.personRepositoryImp.findByCnh({
      cnh,
      tenantId
    })

    if (person) throw CustomResponse.CONFLICT('Pessoa já cadastrada!')
  }

  private async validateDuplicatedEmail ({
    email,
    tenantId
  }: IFindPersonByEmailProps): Promise<void> {
    const person = await this.personRepositoryImp.findByEmail({
      email,
      tenantId
    })

    if (person) throw CustomResponse.CONFLICT('Pessoa já cadastrada!')
  }

  private async validateDuplicatedPhone ({
    phone,
    tenantId
  }: IFindPersonByPhoneProps): Promise<void> {
    const person = await this.personRepositoryImp.findByPhone({
      phone,
      tenantId
    })

    if (person) throw CustomResponse.CONFLICT('Pessoa já cadastrada!')
  }
}
