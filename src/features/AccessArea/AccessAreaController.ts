import { NextFunction, Request, Response, Router } from 'express'

import { Controller } from '../../core/Controller'
import { ModelAction } from '../../core/interfaces/Model'
import Rules from '../../core/Rules'
import { permissionAuthMiddleware } from '../../middlewares/permissionAuth'
import { AccessAreaModel } from '../../models/AccessArea/AccessAreaModel'
import { AccessAreaRepositoryImp } from '../../models/AccessArea/AccessAreaMongoDB'
import { Permission } from '../../models/AccessGroup/AccessGroupModel'
import { DateUtils } from '../../utils/Date'
import ObjectId from '../../utils/ObjectId'
import { AccessAreaRules } from './AccessAreaRules'
import { AccessAreaService } from './AccessAreaService'

export const AccessAreaServiceImp = new AccessAreaService(AccessAreaRepositoryImp)

class AccessAreaController extends Controller {
  protected rules: Rules = new AccessAreaRules()

  handle (): Router {
    this.router.get(
      '/',
      permissionAuthMiddleware(Permission.read),
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const { tenantId } = request

          const filters = AccessAreaModel.listFilters({
            tenantId,
            ...request.query
          })

          const accessAreas = await AccessAreaServiceImp.list(filters)

          response.OK('Áreas de acessos encontradas com sucesso!', {
            accessAreas
          })
        } catch (error) {
          next(error)
        }
      })

    this.router.get('/select', async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tenantId } = request

        const accessAreas = await AccessAreaServiceImp.findAll({
          tenantId,
          select: ['_id', 'name']
        })

        response.OK('Pontos de acessos encontrados com sucesso!', {
          accessAreas
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
            name,
            accessPointsIds,
            description
          } = request.body

          this.rules.validate(
            { accessPointsIds, isRequiredField: false },
            { description, isRequiredField: false },
            { name }
          )

          const accessAreaModel = new AccessAreaModel({
            name,
            accessPointsIds,
            description,
            tenantId,
            actions: [{
              action: ModelAction.create,
              date: DateUtils.getCurrent(),
              userId
            }]
          })

          const accessArea = await AccessAreaServiceImp.create(accessAreaModel)

          response.CREATED('Área de acesso cadastrada com sucesso!', {
            accessArea: accessArea.show
          })
        } catch (error) {
          next(error)
        }
      })

    this.router.patch(
      '/:accessAreaId',
      permissionAuthMiddleware(Permission.update),
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const { tenantId, userId } = request

          const { accessAreaId } = request.params

          const {
            name,
            accessPointsIds,
            description,
            active
          } = request.body

          this.rules.validate(
            { name, isRequiredField: false },
            { accessPointsIds, isRequiredField: false },
            { description, isRequiredField: false },
            { active, isRequiredField: false }
          )

          await AccessAreaServiceImp.update({
            id: ObjectId(accessAreaId),
            tenantId,
            data: {
              name,
              accessPointsIds,
              description,
              active
            },
            responsibleId: userId
          })

          response.OK('Área de acesso atualizada com sucesso!')
        } catch (error) {
          next(error)
        }
      })

    this.router.delete(
      '/:accessAreaId',
      permissionAuthMiddleware(Permission.delete),
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const { tenantId, userId } = request

          const { accessAreaId } = request.params

          this.rules.validate(
            { accessAreaId }
          )

          await AccessAreaServiceImp.delete({
            id: ObjectId(accessAreaId),
            tenantId,
            responsibleId: userId
          })

          response.OK('Área de acesso removida com sucesso!')
        } catch (error) {
          next(error)
        }
      })

    return this.router
  }
}

const accessAreaController = new AccessAreaController()
export default accessAreaController.handle()
