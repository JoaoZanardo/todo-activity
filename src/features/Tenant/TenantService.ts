import { ClientSession, Types } from 'mongoose'

import { ModelAction } from '../../core/interfaces/Model'
import { AreaModel } from '../../models/Area/AreaModel'
import { PersonTypeModel, TimeUnit } from '../../models/PersonType/PersonTypeModel'
import { PersonTypeRepositoryImp } from '../../models/PersonType/PersonTypeMongoDB'
import { PersonTypeFormModel } from '../../models/PersonTypeForm/PersonTypeFormModel'
import { ITenant, TenantModel } from '../../models/Tenant/TenantModel'
import { TenantRepositoryImp } from '../../models/Tenant/TenantMongoDB'
import { UserModel } from '../../models/User/UserModel'
import MailerServer from '../../services/MailerServer'
import { createdTenatTemplate } from '../../templates/createdTenant'
import CustomResponse from '../../utils/CustomResponse'
import { DateUtils } from '../../utils/Date'
import { AreaServiceImp } from '../Area/AreaController'
import { PersonTypeFormServiceImp } from '../PersonTypeForm/PersonTypeFormController'
import { UserServiceImp } from '../User/UserController'

export class TenantService {
  constructor (
    private tenantRepositoryImp: typeof TenantRepositoryImp
  ) {
    this.tenantRepositoryImp = tenantRepositoryImp
  }

  async findById (id: Types.ObjectId): Promise<TenantModel> {
    const tenant = await this.tenantRepositoryImp.findOneById(id)
    if (!tenant) throw CustomResponse.NOT_FOUND('Tenente não cadastrado!')

    return tenant
  }

  async findByCode (code: string): Promise<TenantModel> {
    const tenant = await this.tenantRepositoryImp.findByCode(code)
    if (!tenant) throw CustomResponse.NOT_FOUND('Tenente não cadastrado!')

    return tenant
  }

  async findAll (): Promise<Array<Partial<ITenant>>> {
    return await this.tenantRepositoryImp.findAll()
  }

  async create (tenant: TenantModel, session: ClientSession): Promise<TenantModel> {
    await this.validateDuplicatedEmail(tenant.email)

    const createdTenant = await this.tenantRepositoryImp.create(tenant, session)

    await this.createDefaultDocuments(createdTenant._id!, session)

    await this.sendEmailWithTenantInfo(createdTenant, session)

    return createdTenant
  }

  async update (id: Types.ObjectId, data: Partial<ITenant>): Promise<void> {
    const tenant = await this.findById(id)

    const updated = await this.tenantRepositoryImp.updateById({
      id,
      data: {
        ...data,
        actions: [
          ...tenant.actions!,
          (
            data.deletionDate ? {
              action: ModelAction.delete,
              date: DateUtils.getCurrent()
            } : {
              action: ModelAction.update,
              date: DateUtils.getCurrent()
            }
          )
        ]
      }
    })

    if (!updated) {
      throw CustomResponse.INTERNAL_SERVER_ERROR('Ocorreu um erro ao tentar atualizar tenente!', {
        tenantId: id
      })
    }
  }

  private async validateDuplicatedEmail (email: string): Promise<void> {
    const exists = await this.tenantRepositoryImp.findByEmail(email)

    if (exists) throw CustomResponse.CONFLICT('Email já cadastrado!')
  }

  private async sendEmailWithTenantInfo (tenant: TenantModel, session: ClientSession): Promise<void> {
    const password = 'admin'

    const userModel = new UserModel({
      login: 'admin',
      email: tenant.email,
      name: tenant.name,
      tenantId: tenant._id!,
      password,
      actions: [{
        action: ModelAction.create,
        date: DateUtils.getCurrent()
      }],
      admin: true
    })

    await UserServiceImp.create(userModel, session)

    await MailerServer.sendEmail({
      receiver: tenant.object.email,
      subject: 'Conta teste cadastrada com sucesso!',
      html: createdTenatTemplate({
        password,
        tenant
      })
    })
  }

  private async createDefaultDocuments (tenantId: Types.ObjectId, session: ClientSession): Promise<void> {
    const visitorPersonType = new PersonTypeModel({
      name: 'Visitante',
      tenantId,
      expiringTime: {
        value: 1,
        unit: TimeUnit.day
      }
    })

    const createdVisitorPersonType = await PersonTypeRepositoryImp.create(visitorPersonType, session)

    const visitorPersonTypeForm = new PersonTypeFormModel({
      fields: [],
      personTypeId: createdVisitorPersonType._id!,
      tenantId
    })

    await PersonTypeFormServiceImp.create(visitorPersonTypeForm, session)

    const mainAreaModel = new AreaModel({
      main: true,
      name: 'Área principal',
      tenantId,
      type: 'commonArea',
      description: 'Área principal do condomínio!'
    })

    await AreaServiceImp.create(mainAreaModel)
  }
}
