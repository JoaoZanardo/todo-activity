import { NextFunction, Request, Response, Router } from 'express'
import { Aggregate } from 'mongoose'

import env from '../config/env'
import TenantController from '../features/Tenant/TenantController'
import { customResponseMiddleware } from '../middlewares/customResponse'
import { errorMiddleware } from '../middlewares/error'
import { tenantAuthMiddleware } from '../middlewares/tenantAuth'
import { AccessReleaseInvitationModel } from '../models/AccessReleaseInvitation/AccessReleaseInvitationModel'
import AccessReleaseInvitationMongoDB from '../models/AccessReleaseInvitation/AccessReleaseInvitationMongoDB'
import CustomResponse from '../utils/CustomResponse'
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
    const {
      accessReleaseInvitationId
    } = request.params

    const aggregationStages: Aggregate<Array<any>> = AccessReleaseInvitationMongoDB.aggregate([
      {
        $match: {
          _id: ObjectId(accessReleaseInvitationId),
          deletionDate: null
        }
      },
      {
        $lookup: {
          from: 'tenants',
          localField: 'tenantId',
          foreignField: '_id',
          as: 'tenant'
        }
      },
      {
        $unwind: '$tenant'
      },
      {
        $lookup: {
          from: 'people',
          localField: 'personId',
          foreignField: '_id',
          as: 'person'
        }
      },
      {
        $unwind: '$person'
      },
      {
        $lookup: {
          from: 'areas',
          localField: 'areaId',
          foreignField: '_id',
          as: 'area'
        }
      },
      {
        $unwind: '$area'
      },
      {
        $lookup: {
          from: 'people',
          localField: 'guestId',
          foreignField: '_id',
          as: 'guest'
        }
      },
      {
        $unwind: {
          path: '$guest',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'accessreleaseinvitationgroups',
          localField: 'accessReleaseInvitationGroupId',
          foreignField: '_id',
          as: 'accessReleaseInvitationGroup'
        }
      },
      {
        $unwind: {
          path: '$accessReleaseInvitationGroup',
          preserveNullAndEmptyArrays: true
        }
      },
      { $sort: { _id: -1 } }
    ])

    const accessReleaseInvitations = await AccessReleaseInvitationMongoDB.aggregatePaginate(aggregationStages)

    const accessReleaseInvitation = accessReleaseInvitations.docs[0]

    if (!accessReleaseInvitation) throw CustomResponse.NOT_FOUND('Convite não cadastrado!')

    const accessReleaseInvitationModel = new AccessReleaseInvitationModel(accessReleaseInvitation)

    response.OK('Convite encontrado com sucesso!', {
      accessReleaseInvitation: accessReleaseInvitationModel.show
    })
  } catch (error) {
    next(error)
  }
})

router.get('/unauth/password-reset-requests/:token/:tenantId', async (request: Request, response: Response, next: NextFunction) => {
  try {
    const {
      token,
      tenantId
    } = request.params

    console.log({
      token,
      tenantId
    })

    response.redirect(`${env.resetPasswordUrl}${token}/${tenantId}`)
  } catch (error) {
    next(error)
  }
})

router.use(tenantAuthMiddleware)

router.use('/auth', auth)
router.use('/unauth', unauth)

router.use(errorMiddleware)

export default router
