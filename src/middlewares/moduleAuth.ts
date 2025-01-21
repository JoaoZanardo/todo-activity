import { NextFunction, Request, Response } from 'express'

import CustomResponse from '../utils/CustomResponse'

export const moduleAuthMiddleware = (moduleName: string) => {
  return (request: Request, response: Response, next: NextFunction) => {
    try {
      const { user } = request

      if (!user.admin) {
        const module = user.accessGroup!.modules.find(module => module.name === moduleName)

        if (!module) throw CustomResponse.FORBIDDEN('Acesso negado!')

        next()
      } else {
        next()
      }
    } catch (error) {
      next(error)
    }
  }
}
