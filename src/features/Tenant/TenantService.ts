import { ClientSession, Types } from 'mongoose'

import { ModelAction } from '../../core/interfaces/Model'
import { TenantModel } from '../../models/Tenant/TenantModel'
import { TenantRepositoryImp } from '../../models/Tenant/TenantMongoDB'
import { UserModel } from '../../models/User/UserModel'
import MailerServer from '../../services/MailerServer'
import { createdTenatTemplate } from '../../templates/createdTenant'
import CustomResponse from '../../utils/CustomResponse'
import { DateUtils } from '../../utils/Date'
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

  async create (tenant: TenantModel, session: ClientSession): Promise<TenantModel> {
    await this.validateDuplicatedEmail(tenant.email)

    const createdTenant = await this.tenantRepositoryImp.create(tenant, session)

    await this.sendEmailWithTenantInfo(createdTenant, session)

    return createdTenant
  }

  private async validateDuplicatedEmail (email: string): Promise<void> {
    const exists = await this.tenantRepositoryImp.findByEmail(email)

    if (exists) throw CustomResponse.CONFLICT('Email já cadastrado!')
  }

  private async sendEmailWithTenantInfo (tenant: TenantModel, session: ClientSession): Promise<void> {
    const password = 'Access@2024'

    const userModel = new UserModel({
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
}
