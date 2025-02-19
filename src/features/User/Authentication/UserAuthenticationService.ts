/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable unused-imports/no-unused-vars */

import { ModelAction } from '../../../core/interfaces/Model'
import Bcrypt from '../../../libraries/Bcrypt'
import Jwt from '../../../libraries/Jwt'
import { IAuthenticatedProps, ISignInProps, ISignUpProps, ITokenPayload, UserCreationType, UserModel } from '../../../models/User/UserModel'
import CustomResponse from '../../../utils/CustomResponse'
import { DateUtils } from '../../../utils/Date'
import { PersonServiceImp } from '../../Person/PersonController'
import { UserServiceImp } from '../UserController'

export class UserAuthenticationService {
  async signup ({
    tenantId,
    login,
    password,
    session
  }: ISignUpProps): Promise<IAuthenticatedProps> {
    const cpf = login

    const person = await PersonServiceImp.findByCpf({
      cpf,
      tenantId
    })

    if (!person.appAccess) throw CustomResponse.BAD_REQUEST('Pessoa não possui liberação para acessar o APP!')

    const encryptedPassword = await Bcrypt.hash(password)

    const userModel = new UserModel({
      login,
      name: person.name,
      password: encryptedPassword,
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

  private generateAccessToken (payload: ITokenPayload): string {
    const token = Jwt.generate(payload)
    if (!token) throw CustomResponse.INTERNAL_SERVER_ERROR('Não foi possível gerar o token de acesso!')

    return token
  }
}
