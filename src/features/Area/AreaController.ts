import { NextFunction, Request, Response, Router } from 'express'

import { Controller } from '../../core/Controller'
import { ModelAction } from '../../core/interfaces/Model'
import Rules from '../../core/Rules'
import { permissionAuthMiddleware } from '../../middlewares/permissionAuth'
import { Permission } from '../../models/AccessGroup/AccessGroupModel'
import { AreaModel } from '../../models/Area/AreaModel'
import { AreaRepositoryImp } from '../../models/Area/AreaMongoDB'
import { DateUtils } from '../../utils/Date'
import ObjectId from '../../utils/ObjectId'
import { AreaRules } from './AreaRules'
import { AreaService } from './AreaService'

export const AreaServiceImp = new AreaService(AreaRepositoryImp)

class AreaController extends Controller {
  protected rules: Rules = new AreaRules()

  handle (): Router {
    this.router.get(
      '/',
      permissionAuthMiddleware(Permission.read),
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const { tenantId } = request

          const filters = AreaModel.listFilters({
            tenantId,
            ...request.query
          })

          const areas = await AreaServiceImp.list(filters)

          response.OK('Áreas encontradas com sucesso!', {
            areas
          })
        } catch (error) {
          next(error)
        }
      })

    this.router.get('/select', async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tenantId } = request

        const areas = await AreaServiceImp.findAll({
          tenantId,
          select: ['_id', 'name', 'type']
        })

        response.OK('Áreas encontradas com sucesso!', {
          areas
        })
      } catch (error) {
        next(error)
      }
    })

    this.router.get('/main', async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tenantId } = request

        const areas = await AreaServiceImp.findMain(tenantId)

        response.OK('Áreas encontradas com sucesso!', {
          areas
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
            type,
            analysis,
            name,
            description,
            areaId
          } = request.body

          this.rules.validate(
            { analysis, isRequiredField: false },
            { description, isRequiredField: false },
            { areaId, isRequiredField: false },
            { name },
            { type }
          )

          const areaModel = new AreaModel({
            name,
            description,
            type,
            areaId,
            analysis,
            tenantId,
            actions: [{
              action: ModelAction.create,
              date: DateUtils.getCurrent(),
              userId
            }]
          })

          const area = await AreaServiceImp.create(areaModel)

          response.CREATED('Área cadastrada com sucesso!', {
            area: area.show
          })
        } catch (error) {
          next(error)
        }
      })

    this.router.patch(
      '/:areaId',
      permissionAuthMiddleware(Permission.update),
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const { tenantId, userId } = request

          const { areaId: updateAreaId } = request.params

          const {
            type,
            areaId,
            analysis,
            name,
            description,
            active
          } = request.body

          this.rules.validate(
            { areaId: updateAreaId },
            { type, isRequiredField: false },
            { areaId, isRequiredField: false },
            { analysis, isRequiredField: false },
            { name, isRequiredField: false },
            { description, isRequiredField: false },
            { active, isRequiredField: false },
            { areaId, isRequiredField: false }
          )

          await AreaServiceImp.update({
            id: ObjectId(updateAreaId),
            tenantId,
            data: {
              type,
              areaId,
              analysis,
              name,
              description,
              active
            },
            responsibleId: userId
          })

          response.OK('Área atualizada com sucesso!')
        } catch (error) {
          next(error)
        }
      })

    // this.router.delete(
    //   '/:areaId',
    //   permissionAuthMiddleware(Permission.delete),
    //   async (request: Request, response: Response, next: NextFunction) => {
    //     try {
    //       const { tenantId, userId } = request

    //       const { areaId } = request.params

    //       this.rules.validate(
    //         { areaId }
    //       )

    //       await AreaServiceImp.delete({
    //         id: ObjectId(areaId),
    //         tenantId,
    //         responsibleId: userId
    //       })

    //       response.OK('Área removida com sucesso!')
    //     } catch (error) {
    //       next(error)
    //     }
    //   })

    return this.router
  }
}

const areaController = new AreaController()
export default areaController.handle()
