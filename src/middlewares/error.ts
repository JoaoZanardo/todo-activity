import { NextFunction, Request, Response } from 'express'

export const errorMiddleware = (
  error: any,
  request: Request,
  response: Response,
  next: NextFunction
) => {
  if (!error.code || typeof error.code !== 'number') {
    return response.status(500).json({
      code: 500,
      status: 'INTERNAL_SERVER_ERROR',
      message: error.message
    })
  }

  return response.status(error.code).json(error)
}
