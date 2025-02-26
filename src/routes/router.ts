import { NextFunction, Request, Response, Router } from 'express'

import { AccessReleaseInvitationServiceImp } from '../features/AccessReleaseInvitation/AccessReleaseInvitationController'
import TenantController from '../features/Tenant/TenantController'
import { customResponseMiddleware } from '../middlewares/customResponse'
import { errorMiddleware } from '../middlewares/error'
import { tenantAuthMiddleware } from '../middlewares/tenantAuth'
import ObjectId from '../utils/ObjectId'
import auth from './auth'
import unauth from './unauth'

const router = Router()

router.use((req, res, next) => {
  customResponseMiddleware(res)
  next()
})

router.get('/', async (request: Request, response: Response) => {
  response.json({ foo: 'bar' })
})

router.use('/tenants', TenantController)

router.get('/unauth/access-release-invitations/:accessReleaseInvitationId', async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { tenantId } = request

    const {
      accessReleaseInvitationId
    } = request.params

    const accessReleaseInvitation = await AccessReleaseInvitationServiceImp.findById({
      id: ObjectId(accessReleaseInvitationId),
      tenantId
    })

    response.OK('Convite encontrado com sucesso!', {
      accessReleaseInvitation: accessReleaseInvitation.show
    })
  } catch (error) {
    next(error)
  }
})

router.use(tenantAuthMiddleware)

router.use('/auth', auth)
router.use('/unauth', unauth)

router.use(errorMiddleware)

export default router
