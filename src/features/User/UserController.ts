import { NextFunction, Request, Response, Router } from 'express'

import { Controller } from '../../core/Controller'
import { ModelAction } from '../../core/interfaces/Model'
import Rules from '../../core/Rules'
import { UserModel } from '../../models/User/UserModel'
import { UserRepositoryImp } from '../../models/User/UserMongoDB'
import { DateUtils } from '../../utils/Date'
import ObjectId from '../../utils/ObjectId'
import { UserRules } from './UserRules'
import { UserService } from './UserService'

export const UserServiceImp = new UserService(UserRepositoryImp)

class UserController extends Controller {
  protected rules: Rules = new UserRules()

  handle (): Router {
    this.router.get('/one/:userId', async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tenantId } = request

        const { userId } = request.params

        this.rules.validate(
          { userId }
        )

        const user = await UserServiceImp.findById({
          id: ObjectId(userId),
          tenantId
        })

        response.OK('Usuário encontrado com sucesso!', {
          user: user.show
        })
      } catch (error) {
        next(error)
      }
    })

    this.router.get('/profile', async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { user } = request

        response.OK('Usuário encontrado com sucesso!', {
          user
        })
      } catch (error) {
        next(error)
      }
    })

    this.router.patch('/:userId', async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { user, tenantId } = request

        const { userId } = request.params

        const {
          email,
          active,
          name,
          password
        } = request.body

        this.rules.validate(
          { userId },
          { email, isRequiredField: false },
          { active, isRequiredField: false },
          { name, isRequiredField: false },
          { password, isRequiredField: false }
        )

        await UserServiceImp.update({
          id: ObjectId(userId),
          tenantId,
          responsibleId: user._id!,
          data: {
            email,
            active,
            name,
            password
          }
        })

        response.OK('Usuário atualizado com sucesso!')
      } catch (error) {
        next(error)
      }
    })

    this.router.get('/', async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tenantId } = request

        const filters = UserModel.listFilters({
          tenantId,
          ...request.query
        })

        const users = await UserServiceImp.list(filters)

        response.OK('Usuários encontrados com sucesso!', {
          users
        })
      } catch (error) {
        next(error)
      }
    })

    this.router.post('/', async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tenantId, user } = request

        const {
          email,
          password,
          name,
          accessGroupId,
          login,
          active
        } = request.body

        this.rules.validate(
          { email, isRequiredField: false },
          { name },
          { login },
          { password },
          { accessGroupId },
          { active, isRequiredField: false }
        )

        const userModel = new UserModel({
          active,
          login,
          email,
          tenantId,
          password,
          actions: [{
            action: ModelAction.create,
            date: DateUtils.getCurrent(),
            userId: user._id!
          }],
          accessGroupId,
          name
        })

        const createdUser = await UserServiceImp.create(userModel)

        response.CREATED('Usuário cadastrado com sucesso!', {
          user: createdUser.show
        })
      } catch (error) {
        next(error)
      }
    })

    this.router.patch('/:userId', async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tenantId } = request

        const { userId } = request.params

        const {
          exponentPushTokens
        } = request.body

        console.log({ body: request.body })

        console.log({ exponentPushTokens, exponentPushToken: exponentPushTokens[0] })

        this.rules.validate(
          { userId },
          { exponentPushTokens }
        )

        await UserServiceImp.update({
          id: ObjectId(userId),
          tenantId,
          data: {
            pushToken: exponentPushTokens[0]
          },
          responsibleId: ObjectId(userId)
        })

        response.OK('Usuário atualizado com sucesso!')
      } catch (error) {
        next(error)
      }
    })

    this.router.delete('/:userId', async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tenantId, user } = request

        const { userId } = request.params

        this.rules.validate(
          { userId }
        )

        await UserServiceImp.delete({
          id: ObjectId(userId),
          tenantId,
          responsibleId: user._id!
        })

        response.OK('Usuário removido com sucesso!')
      } catch (error) {
        next(error)
      }
    })

    return this.router
  }
}

const userController = new UserController()
export default userController.handle()
