import { NextFunction, Request, Response } from 'express'

import CustomResponse from '../utils/CustomResponse'

export const adminAuthMiddleware = (request: Request, response: Response, next: NextFunction) => {
  const user = request.user

  if (!user.admin) throw CustomResponse.FORBIDDEN('Acesso negado!')

  next()
}
