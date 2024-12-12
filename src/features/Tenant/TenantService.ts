import { ClientSession, Types } from 'mongoose'

import { ModelAction } from '../../core/interfaces/Model'
import { TenantModel } from '../../models/Tenant/TenantModel'
import { TenantRepositoryImp } from '../../models/Tenant/TenantMongoDB'
import { UserModel } from '../../models/User/UserModel'
import MailerServer from '../../services/MailerServer'
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
    const createdTenant = await this.tenantRepositoryImp.create(tenant, session)

    await this.sendEmailWithTenantInfo(createdTenant, session)

    return createdTenant
  }

  async sendEmailWithTenantInfo (tenant: TenantModel, session: ClientSession): Promise<void> {
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

    const user = await UserServiceImp.create(userModel, session)

    await MailerServer.sendEmail({
      receiver: tenant.object.email,
      subject: 'Conta teste cadastrada com sucesso!',
      html: `
       <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f9;
              color: #333;
              margin: 0;
              padding: 0;
            }
            .container {
              width: 100%;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #ffffff;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              border-radius: 8px;
            }
            h1 {
              color: red;
              text-align: center;
            }
            p {
              font-size: 16px;
              line-height: 1.5;
              margin: 10px 0;
            }
            .info-box {
              background-color: #f9f9f9;
              border: 1px solid #ddd;
              padding: 15px;
              border-radius: 5px;
              margin-top: 20px;
            }
            .info-box b {
              font-size: 18px;
              color: #333;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              font-size: 12px;
              color: #aaa;
            }
            .btn {
              display: inline-block;
              background-color: red;
              color: #fff;
              padding: 12px 20px;
              text-decoration: none;
              border-radius: 5px;
              text-align: center;
              font-weight: bold;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Conta Teste Cadastrada com Sucesso!</h1>
            <p>Olá, ${user.object.email},</p>
            <p>Sua conta teste foi cadastrada com sucesso! Agora, você pode acessar o sistema utilizando o código de licença abaixo:</p>
            <div class="info-box">
              <p><b>Código de Licença:</b> ${tenant._id}</p>
              <p><b>Email:</b> ${user.object.email}</p>
              <p><b>Senha:</b> ${password}</p>
            </div>
            <p>Para acessar o sistema, clique no botão abaixo:</p>
            <a href="https://seusistema.com" class="btn">Acessar o Sistema</a>
            <div class="footer">
              <p>&copy; 2024 Defense Access. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
      </html>
      `
    })
  }
}
