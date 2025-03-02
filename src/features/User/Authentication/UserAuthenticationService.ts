/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable unused-imports/no-unused-vars */
import to from 'await-to-js'
import { Types } from 'mongoose'

import { ModelAction } from '../../../core/interfaces/Model'
import Bcrypt from '../../../libraries/Bcrypt'
import Jwt from '../../../libraries/Jwt'
import { PasswordResetRequestModel, PasswordResetRequestStatus } from '../../../models/PasswordResetRequest/PasswordResetRequestModel'
import { IAuthenticatedProps, IResetUserPasswordProps, ISignInProps, ISignUpProps, ITokenPayload, UserCreationType, UserModel } from '../../../models/User/UserModel'
import MailerServer from '../../../services/MailerServer'
import { resetPasswordTemplate } from '../../../templates/resetPassword'
import CustomResponse from '../../../utils/CustomResponse'
import { DateUtils } from '../../../utils/Date'
import { generate } from '../../../utils/generate'
import { PasswordResetRequestServiceImp } from '../../PasswordResetRequest/PasswordResetRequestController'
import { PersonServiceImp } from '../../Person/PersonController'
import { UserServiceImp } from '../UserController'

export class UserAuthenticationService {
  async signup ({
    tenantId,
    login,
    password,
    session,
    email
  }: ISignUpProps): Promise<IAuthenticatedProps> {
    const cpf = login

    const person = await PersonServiceImp.findByCpf({
      cpf,
      tenantId
    })

    if (!person.appAccess) throw CustomResponse.BAD_REQUEST('Pessoa não possui liberação para acessar o APP!')

    const userModel = new UserModel({
      email,
      login,
      name: person.name,
      password,
      tenantId,
      personId: person._id!,
      actions: [{
        action: ModelAction.create,
        date: DateUtils.getCurrent()
      }],
      creationType: UserCreationType.app
    })

    const user = await UserServiceImp.create(userModel, session)

    await PersonServiceImp.update({
      id: person._id!,
      data: {
        userId: user._id
      },
      tenantId,
      session
    })

    const token = this.generateAccessToken({
      userId: user._id!
    })

    return {
      user: user.show,
      token
    }
  }

  async signin ({
    tenantId,
    login,
    password
  }: ISignInProps): Promise<IAuthenticatedProps> {
    const user = await UserServiceImp.findByLogin({
      login,
      tenantId
    })

    const accessGroup = user.accessGroup

    if (accessGroup && !accessGroup.active) throw CustomResponse.FORBIDDEN('Acesso negado!')

    const isValid = await Bcrypt.compare(password, user.object.password!)
    if (!isValid) throw CustomResponse.UNPROCESSABLE_ENTITY('As credenciais fornecidas estão incorretas!')

    const token = this.generateAccessToken({
      userId: user._id!
    })

    return {
      user: user.show,
      token
    }
  }

  async sendResetPasswordEmail (email: string, tenantId: Types.ObjectId): Promise<void> {
    const user = await UserServiceImp.findByEmail({
      email,
      tenantId
    })

    const [_, passwordResetRequest] = await to(PasswordResetRequestServiceImp.findInProcessByuserId({
      userId: user._id!,
      tenantId
    }))

    if (passwordResetRequest) throw CustomResponse.CONFLICT('Já existe uma requisição de redefinição de senha em andamento!')

    const token = generate.passwordToken()

    const createdPasswordResetRequest = new PasswordResetRequestModel({
      email,
      userId: user._id!,
      token,
      tenantId
    })

    await PasswordResetRequestServiceImp.create(createdPasswordResetRequest)

    await to(MailerServer.sendEmail({
      subject: 'Resete sua senha!',
      html: resetPasswordTemplate(token, tenantId),
      receiver: email
    }))
  }

  async resetPassword ({
    token,
    password,
    session,
    tenantId
  }: IResetUserPasswordProps): Promise<IAuthenticatedProps> {
    const passwordResetRequest = await PasswordResetRequestServiceImp.findByToken({
      token,
      tenantId
    })

    if (passwordResetRequest.object.status !== PasswordResetRequestStatus.pending) {
      throw CustomResponse.BAD_REQUEST('Não é possível redefinir senha!')
    }

    const encryptedPassword = await Bcrypt.hash(password)

    await UserServiceImp.update({
      id: passwordResetRequest.userId,
      tenantId,
      data: {
        password: encryptedPassword
      },
      session
    })

    await PasswordResetRequestServiceImp.update({
      id: passwordResetRequest._id!,
      tenantId,
      data: {
        status: PasswordResetRequestStatus.reseted
      },
      session
    })

    const user = await UserServiceImp.findById({
      id: passwordResetRequest.userId,
      tenantId
    })

    const accessToken = this.generateAccessToken({
      userId: user._id!
    })

    return {
      user: user.show,
      token: accessToken
    }
  }

  private generateAccessToken (payload: ITokenPayload): string {
    const token = Jwt.generate(payload)
    if (!token) throw CustomResponse.INTERNAL_SERVER_ERROR('Não foi possível gerar o token de acesso!')

    return token
  }
}
