import { NextFunction, Request, Response } from 'express'

import { Permission } from '../models/AccessGroup/AccessGroupModel'
import CustomResponse from '../utils/CustomResponse'

export const permissionAuthMiddleware = (permissionName: Permission) => {
  return (request: Request, response: Response, next: NextFunction) => {
    try {
      const { user } = request

      if (user.admin) next()

      const module = user.accessGroup!.modules.find(module => {
        const exists = module.permissions.find(permission => permission === permissionName)

        return exists
      })

      if (!module) throw CustomResponse.FORBIDDEN('Acesso negado!')

      next()
    } catch (error) {
      next(error)
    }
  }
}
