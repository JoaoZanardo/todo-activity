import { NextFunction, Request, Response, Router } from 'express'

import { Controller } from '../../core/Controller'
import { ModelAction } from '../../core/interfaces/Model'
import Rules from '../../core/Rules'
import { NoticeModel } from '../../models/Notice/NoticeModel'
import { NoticeRepositoryImp } from '../../models/Notice/NoticeMongoDB'
import { DateUtils } from '../../utils/Date'
import ObjectId from '../../utils/ObjectId'
import { NoticeRules } from './NoticeRules'
import { NoticeService } from './NoticeService'

export const NoticeServiceImp = new NoticeService(NoticeRepositoryImp)

class NoticeController extends Controller {
  protected rules: Rules = new NoticeRules()

  handle (): Router {
    this.router.get('/', async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tenantId, personId } = request

        const filters = NoticeModel.listFilters({
          tenantId,
          personId,
          ...request.query
        })

        const notices = await NoticeServiceImp.list(filters)

        response.OK('Avisos encontrados com sucesso!', {
          notices
        })
      } catch (error) {
        next(error)
      }
    })

    this.router.get('/one/:noticeId', async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tenantId } = request

        const { noticeId } = request.params

        this.rules.validate(
          { noticeId }
        )

        const notice = await NoticeServiceImp.findById({
          id: ObjectId(noticeId),
          tenantId
        })

        response.OK('Aviso encontrado com sucesso!', {
          notice: notice.show
        })
      } catch (error) {
        next(error)
      }
    })

    this.router.post('/', async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tenantId, userId, personId } = request

        const {
          active,
          type,
          endDate,
          initDate,
          observation,
          areaId,
          deliveryType,
          serviceProviderName,
          serviceType,
          deliveryProviderName
        } = request.body

        this.rules.validate(
          { active, isRequiredField: false },
          { type },
          { areaId },
          { deliveryType, isRequiredField: false },
          { serviceProviderName, isRequiredField: false },
          { serviceType, isRequiredField: false },
          { endDate, isRequiredField: false },
          { initDate, isRequiredField: false },
          { observation, isRequiredField: false },
          { deliveryProviderName, isRequiredField: false }
        )

        const noticeModel = new NoticeModel({
          tenantId,
          actions: [{
            action: ModelAction.create,
            date: DateUtils.getCurrent(),
            userId
          }],
          active,
          personId,
          type,
          areaId,
          deliveryType,
          serviceProviderName,
          serviceType,
          deliveryProviderName,
          initDate: initDate ? DateUtils.parse(initDate) ?? undefined : undefined,
          endDate: endDate ? DateUtils.parse(endDate) ?? undefined : undefined,
          observation
        })

        const notice = await NoticeServiceImp.create(noticeModel)

        response.CREATED('Aviso cadastrado com sucesso!', {
          notice: notice.show
        })
      } catch (error) {
        next(error)
      }
    })

    this.router.patch('/:noticeId', async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tenantId, userId } = request

        const { noticeId } = request.params

        const {
          discharged
        } = request.body

        this.rules.validate(
          { noticeId },
          { discharged }
        )

        await NoticeServiceImp.update({
          id: ObjectId(noticeId),
          tenantId,
          data: {
            discharged
          },
          responsibleId: userId
        })

        response.OK('Aviso atualizado com sucesso!')
      } catch (error) {
        next(error)
      }
    })

    this.router.delete('/:noticeId', async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tenantId, userId } = request

        const { noticeId } = request.params

        this.rules.validate(
          { noticeId }
        )

        await NoticeServiceImp.delete({
          id: ObjectId(noticeId),
          tenantId,
          responsibleId: userId
        })

        response.OK('Aviso removido com sucesso!')
      } catch (error) {
        next(error)
      }
    })

    return this.router
  }
}

const noticeController = new NoticeController()
export default noticeController.handle()
