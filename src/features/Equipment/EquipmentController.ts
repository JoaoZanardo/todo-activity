import { NextFunction, Request, Response, Router } from 'express'

import { Controller } from '../../core/Controller'
import { ModelAction } from '../../core/interfaces/Model'
import Rules from '../../core/Rules'
import { permissionAuthMiddleware } from '../../middlewares/permissionAuth'
import { Permission } from '../../models/AccessGroup/AccessGroupModel'
import { EquipmentModel } from '../../models/Equipment/EquipmentModel'
import { EquipmentRepositoryImp } from '../../models/Equipment/EquipmentMongoDB'
import { DateUtils } from '../../utils/Date'
import ObjectId from '../../utils/ObjectId'
import { EquipmentRules } from './EquipmentRules'
import { EquipmentService } from './EquipmentService'

export const EquipmentServiceImp = new EquipmentService(EquipmentRepositoryImp)

class EquipmentController extends Controller {
  protected rules: Rules = new EquipmentRules()

  handle (): Router {
    this.router.get(
      '/',
      permissionAuthMiddleware(Permission.read),
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const { tenantId } = request

          const filters = EquipmentModel.listFilters({
            tenantId,
            ...request.query
          })

          const equipments = await EquipmentServiceImp.list(filters)

          response.OK('Equipamentos encontrados com sucesso!', {
            equipments
          })
        } catch (error) {
          next(error)
        }
      })

    this.router.get('/select', async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tenantId } = request

        const equipments = await EquipmentServiceImp.findAll({
          tenantId,
          select: ['_id', 'name', 'pattern']
        })

        response.OK('Equipamentos encontrados com sucesso!', {
          equipments
        })
      } catch (error) {
        next(error)
      }
    })

    this.router.get(
      '/one/:equipmentId',
      permissionAuthMiddleware(Permission.read),
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const { tenantId } = request

          const { equipmentId } = request.params

          this.rules.validate(
            { equipmentId }
          )

          const equipment = await EquipmentServiceImp.findById({
            id: ObjectId(equipmentId),
            tenantId
          })

          response.OK('Equipamento encontrado com sucesso!', {
            equipment: equipment.show
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
            serialNumber,
            description,
            pattern,
            ip,
            name
          } = request.body

          this.rules.validate(
            { serialNumber, isRequiredField: false },
            { description, isRequiredField: false },
            { pattern },
            { name },
            { ip }
          )

          const equipmentModel = new EquipmentModel({
            tenantId,
            actions: [{
              action: ModelAction.create,
              date: DateUtils.getCurrent(),
              userId
            }],
            serialNumber,
            description,
            pattern,
            ip,
            name
          })

          const equipment = await EquipmentServiceImp.create(equipmentModel)

          response.CREATED('Equipamento cadastrado com sucesso!', {
            equipment: equipment.show
          })
        } catch (error) {
          next(error)
        }
      })

    this.router.patch(
      '/:equipmentId',
      permissionAuthMiddleware(Permission.update),
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const { tenantId, userId } = request

          const { equipmentId } = request.params

          const {
            serialNumber,
            pattern,
            description,
            ip,
            name,
            active
          } = request.body

          this.rules.validate(
            { serialNumber, isRequiredField: false },
            { description, isRequiredField: false },
            { pattern, isRequiredField: false },
            { ip, isRequiredField: false },
            { name, isRequiredField: false },
            { active, isRequiredField: false }
          )

          await EquipmentServiceImp.update({
            id: ObjectId(equipmentId),
            tenantId,
            data: {
              serialNumber,
              description,
              pattern,
              ip,
              name,
              active
            },
            responsibleId: userId
          })

          response.OK('Equipamento atualizado com sucesso!')
        } catch (error) {
          next(error)
        }
      })

    this.router.delete(
      '/:equipmentId',
      permissionAuthMiddleware(Permission.delete),
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const { tenantId, userId } = request

          const { equipmentId } = request.params

          this.rules.validate(
            { equipmentId }
          )

          await EquipmentServiceImp.delete({
            id: ObjectId(equipmentId),
            tenantId,
            responsibleId: userId
          })

          response.OK('Equipamento removido com sucesso!')
        } catch (error) {
          next(error)
        }
      })

    return this.router
  }
}

const equipmentController = new EquipmentController()
export default equipmentController.handle()
