import { NextFunction, Request, Response, Router } from 'express'

import { Controller } from '../../../core/Controller'
import Rules from '../../../core/Rules'
import { UserRules } from '../UserRules'
import { UserAuthenticationService } from './UserAuthenticationService'

export const UserAuthenticationServiceImp = new UserAuthenticationService()

class UserAuthenticationController extends Controller {
  protected rules: Rules = new UserRules()

  handle (): Router {
    this.router.post('/signin', async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tenantId } = request

        const {
          email,
          password
        } = request.body

        this.rules.validate(
          { email },
          { password }
        )

        const { user, token } = await UserAuthenticationServiceImp.signin({
          email,
          password,
          tenantId
        })

        response.OK('Login efetuado com sucesso!', {
          user,
          token
        })
      } catch (error) {
        next(error)
      }
    })

    return this.router
  }
}

const userAuthenticationController = new UserAuthenticationController()
export default userAuthenticationController.handle()
