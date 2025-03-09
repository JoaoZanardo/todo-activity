import { NextFunction, Request, Response, Router } from 'express'

import { Controller } from '../../core/Controller'
import Rules from '../../core/Rules'
import { PasswordResetRequestRepositoryImp } from '../../models/PasswordResetRequest/PasswordResetRequestMongoDB'
import { PasswordResetRequestService } from './PasswordResetRequestService'

export const PasswordResetRequestServiceImp = new PasswordResetRequestService(
  PasswordResetRequestRepositoryImp
)

class PasswordResetRequestController extends Controller {
  protected rules: Rules = new Rules()

  handle (): Router {
    this.router.get('/:token', async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tenantId } = request

        const {
          token
        } = request.params

        const passwordResetRequest = await PasswordResetRequestServiceImp.findByToken({
          token,
          tenantId
        })

        response.OK('Requisição para redefinição de senha encontrada com sucesso!', {
          passwordResetRequest: passwordResetRequest.show
        })
      } catch (error) {
        next(error)
      }
    })

    return this.router
  }
}

const passwordResetRequestController = new PasswordResetRequestController()
export default passwordResetRequestController.handle()
