import { NextFunction, Request, Response } from 'express'

import { PersonServiceImp } from '../features/Person/PersonController'
import { UserServiceImp } from '../features/User/UserController'
import Jwt from '../libraries/Jwt'
import { UserCreationType } from '../models/User/UserModel'
import CustomResponse from '../utils/CustomResponse'
import ObjectId from '../utils/ObjectId'

export const userAuthMiddleware = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { tenantId } = request

    const authorization = request.headers.authorization

    if (!authorization) throw CustomResponse.UNAUTHORIZED('Acesso negado!')

    const [schema, token] = authorization.split(' ')
    if (!token || schema.toUpperCase() !== 'BEARER') throw CustomResponse.UNAUTHORIZED('Acesso negado!')

    const { userId } = Jwt.decode(token)

    const user = await UserServiceImp.findById({
      id: ObjectId(userId),
      tenantId
    })

    if (!user.active) throw CustomResponse.FORBIDDEN('Acesso negado!')

    if (user.object.creationType === UserCreationType.app) {
      const person = await PersonServiceImp.findById({
        id: user.object.personId!,
        tenantId
      })

      if (!person.appAccess) throw CustomResponse.FORBIDDEN('Acesso negado!')

      request.personId = person._id!
    }

    request.user = user.show
    request.userId = user._id!

    next()
  } catch (error) {
    next(error)
  }
}
