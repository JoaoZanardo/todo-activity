/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable unused-imports/no-unused-vars */

import Bcrypt from '../../../libraries/Bcrypt'
import Jwt from '../../../libraries/Jwt'
import { IAuthenticatedProps, ISignInProps, ITokenPayload } from '../../../models/User/UserModel'
import CustomResponse from '../../../utils/CustomResponse'
import { UserServiceImp } from '../UserController'

export class UserAuthenticationService {
  async signin ({
    tenantId,
    email,
    password
  }: ISignInProps): Promise<IAuthenticatedProps> {
    const user = await UserServiceImp.findByEmail({
      email,
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
