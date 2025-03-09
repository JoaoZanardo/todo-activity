import { NextFunction, Request, Response, Router } from 'express'

import database from '../../../config/database'
import { Controller } from '../../../core/Controller'
import Rules from '../../../core/Rules'
import { PersonServiceImp } from '../../Person/PersonController'
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
          login,
          password
        } = request.body

        this.rules.validate(
          { login },
          { password }
        )

        const { user, token } = await UserAuthenticationServiceImp.signin({
          login,
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

    this.router.post('/people/signup', async (request: Request, response: Response, next: NextFunction) => {
      const session = await database.startSession()
      session.startTransaction()

      try {
        const { tenantId } = request

        const {
          email,
          login,
          password,
          passwordConfirmation
        } = request.body

        this.rules.validate(
          { email },
          { login },
          { password },
          { passwordConfirmation },
          { match: [password, passwordConfirmation] }
        )

        const { user, token } = await UserAuthenticationServiceImp.signup({
          email,
          login,
          password,
          tenantId,
          session
        })

        await session.commitTransaction()
        session.endSession()

        response.OK('Login efetuado com sucesso!', {
          user,
          token
        })
      } catch (error) {
        session.endSession()

        next(error)
      }
    })

    this.router.get('/people/validate-app-access/:cpf', async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tenantId } = request

        const {
          cpf
        } = request.params

        const person = await PersonServiceImp.findByCpf({
          cpf,
          tenantId
        })

        response.OK('Accesso ao APP encontrada com sucesso!', {
          appAccess: Boolean(person.appAccess),
          userAccount: Boolean(person.object.userId)
        })
      } catch (error) {
        next(error)
      }
    })

    this.router.post('/password', async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tenantId } = request

        const {
          email
        } = request.body

        this.rules.validate(
          { email }
        )

        await UserAuthenticationServiceImp.sendResetPasswordEmail(email, tenantId)

        response.OK('Email para redefinição de senha enviado com sucesso!')
      } catch (error) {
        next(error)
      }
    })

    this.router.post('/password/token/:token', async (request: Request, response: Response, next: NextFunction) => {
      const session = await database.startSession()
      session.startTransaction()

      try {
        const { tenantId } = request

        const {
          token
        } = request.params

        const {
          password
        } = request.body

        const { user, token: accessToken } = await UserAuthenticationServiceImp.resetPassword({
          token,
          password,
          session,
          tenantId
        })

        await session.commitTransaction()
        session.endSession()

        response.OK('Senha redefinida com sucesso!', {
          user,
          token: accessToken
        })
      } catch (error) {
        session.endSession()

        next(error)
      }
    })

    return this.router
  }
}

const userAuthenticationController = new UserAuthenticationController()
export default userAuthenticationController.handle()
