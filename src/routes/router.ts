import { Request, Response, Router } from 'express'

import TenantController from '../features/Tenant/TenantController'
import { customResponseMiddleware } from '../middlewares/customResponse'
import { errorMiddleware } from '../middlewares/error'
import { tenantAuthMiddleware } from '../middlewares/tenantAuth'
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

router.use(tenantAuthMiddleware)

router.use('/auth', auth)
router.use('/unauth', unauth)

router.use(errorMiddleware)

export default router
