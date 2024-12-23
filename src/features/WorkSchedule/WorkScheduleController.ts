import { NextFunction, Request, Response, Router } from 'express'

import { Controller } from '../../core/Controller'
import { ModelAction } from '../../core/interfaces/Model'
import Rules from '../../core/Rules'
import { permissionAuthMiddleware } from '../../middlewares/permissionAuth'
import { Permission } from '../../models/AccessGroup/AccessGroupModel'
import { WorkScheduleModel } from '../../models/WorkSchedule/WorkScheduleModel'
import { WorkScheduleRepositoryImp } from '../../models/WorkSchedule/WorkScheduleMongoDB'
import { DateUtils } from '../../utils/Date'
import ObjectId from '../../utils/ObjectId'
import { WorkScheduleRules } from './WorkScheduleRules'
import { WorkScheduleService } from './WorkScheduleService'

export const WorkScheduleServiceImp = new WorkScheduleService(WorkScheduleRepositoryImp)

class WorkScheduleController extends Controller {
  protected rules: Rules = new WorkScheduleRules()

  handle (): Router {
    this.router.get(
      '/',
      permissionAuthMiddleware(Permission.read),
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const { tenantId } = request

          const filters = WorkScheduleModel.listFilters({
            tenantId,
            ...request.query
          })

          const workSchedules = await WorkScheduleServiceImp.list(filters)

          response.OK('Jornads de trabalho encontradas com sucesso!', {
            workSchedules
          })
        } catch (error) {
          next(error)
        }
      })

    this.router.get('/select', async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tenantId } = request

        const personTypes = await WorkScheduleServiceImp.findAll({
          tenantId
        })

        response.OK('Jornadas encontrados com sucesso!', {
          personTypes
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
            days,
            endTime,
            name,
            startTime,
            description
          } = request.body

          this.rules.validate(
            { name },
            { days },
            { hour: startTime },
            { hour: endTime },
            { description, isRequiredField: false }
          )

          const workScheduleModel = new WorkScheduleModel({
            tenantId,
            actions: [{
              action: ModelAction.create,
              date: DateUtils.getCurrent(),
              userId
            }],
            days,
            endTime,
            name,
            startTime,
            description
          })

          const workSchedule = await WorkScheduleServiceImp.create(workScheduleModel)

          response.OK('Jornada de trabalho cadastrada com sucesso!', {
            workSchedule: workSchedule.show
          })
        } catch (error) {
          next(error)
        }
      })

    this.router.patch(
      '/:WorkScheduleId',
      permissionAuthMiddleware(Permission.update),
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const { tenantId, userId } = request

          const { WorkScheduleId } = request.params

          const {
            days,
            endTime,
            name,
            startTime,
            description
          } = request.body

          this.rules.validate(
            { name, isRequiredField: false },
            { days, isRequiredField: false },
            { startTime, isRequiredField: false },
            { endTime, isRequiredField: false },
            { description, isRequiredField: false }
          )

          await WorkScheduleServiceImp.update({
            id: ObjectId(WorkScheduleId),
            tenantId,
            data: {
              name,
              startTime,
              endTime,
              days,
              description
            },
            responsibleId: userId
          })

          response.OK('Jornada de trabalho atualizada com sucesso!')
        } catch (error) {
          next(error)
        }
      })

    this.router.delete(
      '/:WorkScheduleId',
      permissionAuthMiddleware(Permission.delete),
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const { tenantId, userId } = request

          const { WorkScheduleId } = request.params

          this.rules.validate(
            { WorkScheduleId }
          )

          await WorkScheduleServiceImp.delete({
            id: ObjectId(WorkScheduleId),
            tenantId,
            responsibleId: userId
          })

          response.OK('Jornada de trabalho removida com sucesso!')
        } catch (error) {
          next(error)
        }
      })

    return this.router
  }
}

const workScheduleController = new WorkScheduleController()
export default workScheduleController.handle()
