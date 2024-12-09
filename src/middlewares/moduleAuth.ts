import { NextFunction, Request, Response } from 'express'

import CustomResponse from '../utils/CustomResponse'

export const moduleAuthMiddleware = (moduleName: string) => {
  return (request: Request, response: Response, next: NextFunction) => {
    try {
      const { user } = request

      if (user.admin) next()

      const module = user.accessGroup!.modules.find(module => module.name === moduleName)

      console.log({ module })

      if (!module) throw CustomResponse.FORBIDDEN('Acesso negado!')

      next()
    } catch (error) {
      next(error)
    }
  }
}
