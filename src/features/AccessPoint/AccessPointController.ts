import { NextFunction, Request, Response, Router } from 'express'

import { Controller } from '../../core/Controller'
import { ModelAction } from '../../core/interfaces/Model'
import Rules from '../../core/Rules'
import { permissionAuthMiddleware } from '../../middlewares/permissionAuth'
import { Permission } from '../../models/AccessGroup/AccessGroupModel'
import { AccessPointModel } from '../../models/AccessPoint/AccessPointModel'
import { AccessPointRepositoryImp } from '../../models/AccessPoint/AccessPointMongoDB'
import { DateUtils } from '../../utils/Date'
import ObjectId from '../../utils/ObjectId'
import { AccessPointRules } from './AccessPointRules'
import { AccessPointService } from './AccessPointService'

export const AccessPointServiceImp = new AccessPointService(AccessPointRepositoryImp)

class AccessPointController extends Controller {
  protected rules: Rules = new AccessPointRules()

  handle (): Router {
    this.router.get(
      '/',
      permissionAuthMiddleware(Permission.read),
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const { tenantId } = request

          const filters = AccessPointModel.listFilters({
            tenantId,
            ...request.query
          })

          const accessPoints = await AccessPointServiceImp.list(filters)

          response.OK('Pontos de acessos encontrados com sucesso!', {
            accessPoints
          })
        } catch (error) {
          next(error)
        }
      })

    this.router.get('/select', async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tenantId } = request

        const accessPoints = await AccessPointServiceImp.findAll(tenantId)

        response.OK('Pontos de acessos encontrados com sucesso!', {
          accessPoints: accessPoints.docs
        })
      } catch (error) {
        next(error)
      }
    })

    this.router.post(
      '/',
      permissionAuthMiddleware(Permission.create),
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const { tenantId, userId } = request

          const {
            accessType,
            equipmentsIds,
            personTypesIds,
            generalExit,
            name,
            areaId,
            accessAreaId,
            manualAccess
          } = request.body

          this.rules.validate(
            { generalExit, isRequiredField: false },
            { areaId, isRequiredField: false },
            { accessAreaId, isRequiredField: false },
            { manualAccess, isRequiredField: false },
            { name },
            { accessType },
            { equipmentsIds },
            { personTypesIds }
          )

          const accessPointModel = new AccessPointModel({
            name,
            accessType,
            equipmentsIds,
            personTypesIds,
            generalExit,
            tenantId,
            actions: [{
              action: ModelAction.create,
              date: DateUtils.getCurrent(),
              userId
            }],
            areaId,
            accessAreaId,
            manualAccess
          })

          const accessPoint = await AccessPointServiceImp.create(accessPointModel)

          response.CREATED('Ponto de acesso cadastrado com sucesso!', {
            accessPoint: accessPoint.show
          })
        } catch (error) {
          next(error)
        }
      })

    this.router.patch(
      '/:accessPointId',
      permissionAuthMiddleware(Permission.update),
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const { tenantId, userId } = request

          const { accessPointId } = request.params

          const {
            accessType,
            equipmentsIds,
            personTypesIds,
            generalExit,
            name,
            active,
            areaId,
            accessAreaId
          } = request.body

          this.rules.validate(
            { accessPointId },
            { areaId, isRequiredField: false },
            { accessAreaId, isRequiredField: false },
            { name, isRequiredField: false },
            { generalExit, isRequiredField: false },
            { accessType, isRequiredField: false },
            { equipmentsIds, isRequiredField: false },
            { personTypesIds, isRequiredField: false },
            { active, isRequiredField: false }
          )

          await AccessPointServiceImp.update({
            id: ObjectId(accessPointId),
            tenantId,
            data: {
              name,
              accessType,
              equipmentsIds,
              personTypesIds,
              generalExit,
              active,
              areaId,
              accessAreaId
            },
            responsibleId: userId
          })

          response.OK('Ponto de acesso atualizado com sucesso!')
        } catch (error) {
          next(error)
        }
      })

    // this.router.delete(
    //   '/:accessPointId',
    //   permissionAuthMiddleware(Permission.delete),
    //   async (request: Request, response: Response, next: NextFunction) => {
    //     try {
    //       const { tenantId, userId } = request

    //       const { accessPointId } = request.params

    //       this.rules.validate(
    //         { accessPointId }
    //       )

    //       await AccessPointServiceImp.delete({
    //         id: ObjectId(accessPointId),
    //         tenantId,
    //         responsibleId: userId
    //       })

    //       response.OK('Ponto de acesso removido com sucesso!')
    //     } catch (error) {
    //       next(error)
    //     }
    //   })

    return this.router
  }
}

const accessPointController = new AccessPointController()
export default accessPointController.handle()
