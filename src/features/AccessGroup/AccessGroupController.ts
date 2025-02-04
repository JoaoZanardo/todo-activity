import { NextFunction, Request, Response, Router } from 'express'

import { Controller } from '../../core/Controller'
import { ModelAction } from '../../core/interfaces/Model'
import Rules from '../../core/Rules'
import { AccessGroupRules } from '../../features/AccessGroup/AccessGroupRules'
import { permissionAuthMiddleware } from '../../middlewares/permissionAuth'
import { AccessGroupModel, Permission } from '../../models/AccessGroup/AccessGroupModel'
import { AccessGroupRepositoryImp } from '../../models/AccessGroup/AccessGroupMongoDB'
import { DateUtils } from '../../utils/Date'
import ObjectId from '../../utils/ObjectId'
import { AccessGroupService } from './AccessGroupService'

export const AccessGroupServiceImp = new AccessGroupService(
  AccessGroupRepositoryImp
)

export class AccessGroupController extends Controller {
  protected rules: Rules = new AccessGroupRules()

  handle (): Router {
    this.router.get('/select',
      permissionAuthMiddleware(Permission.read),
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const { tenantId } = request

          const accessGroups = await AccessGroupServiceImp.findAll({
            tenantId,
            select: ['_id', 'name']
          })

          response.OK('Grupos de acesso encontrados com sucesso!', {
            accessGroups
          })
        } catch (error) {
          next(error)
        }
      })

    this.router.get('/',
      permissionAuthMiddleware(Permission.read),
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const { tenantId, query } = request

          const filters = AccessGroupModel.listFilters({
            tenantId,
            ...query
          })

          const accessGroup = await AccessGroupServiceImp.list(filters)

          response.OK('Grupo de acesso encontrado com sucesso!', {
            accessGroup
          })
        } catch (error) {
          next(error)
        }
      })

    this.router.get('/:accessGroupId',
      permissionAuthMiddleware(Permission.read),
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const { tenantId } = request

          const {
            accessGroupId
          } = request.params

          this.rules.validate(
            { accessGroupId }
          )

          const accessGroup = await AccessGroupServiceImp.findById({
            id: ObjectId(accessGroupId),
            tenantId
          })

          response.OK('Grupo de acesso encontrado com sucesso!', {
            accessGroup: accessGroup.show
          })
        } catch (error) {
          next(error)
        }
      })

    this.router.post('/',
      permissionAuthMiddleware(Permission.create),
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const { tenantId, user } = request

          const {
            name,
            modules,
            home,
            active
          } = request.body

          this.rules.validate(
            { active, isRequiredField: false },
            { name },
            { modules },
            { home }
          )

          const accessGroupModel = new AccessGroupModel({
            modules,
            name,
            active,
            home,
            tenantId,
            actions: [{
              action: ModelAction.create,
              date: DateUtils.getCurrent(),
              userId: user._id!
            }]
          })

          const accessGroup = await AccessGroupServiceImp.create(accessGroupModel)

          response.CREATED('Grupo de acesso cadastrado com sucesso!', {
            accessGroup
          })
        } catch (error) {
          next(error)
        }
      })

    this.router.patch('/:accessGroupId',
      permissionAuthMiddleware(Permission.update),
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const { tenantId, user } = request

          const { accessGroupId } = request.params

          const {
            name,
            modules,
            home,
            active
          } = request.body

          this.rules.validate(
            { accessGroupId },
            { name, isRequiredField: false },
            { modules, isRequiredField: false },
            { home, isRequiredField: false },
            { active, isRequiredField: false }
          )

          await AccessGroupServiceImp.update({
            id: ObjectId(accessGroupId),
            tenantId,
            data: {
              name,
              modules,
              home,
              active
            },
            responsibleId: user._id!
          })

          response.OK('Grupo de acesso atualizado com sucesso!')
        } catch (error) {
          next(error)
        }
      })

    this.router.delete('/:accessGroupId',
      permissionAuthMiddleware(Permission.delete),
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const { tenantId, user } = request

          const { accessGroupId } = request.params

          this.rules.validate(
            { accessGroupId }
          )

          await AccessGroupServiceImp.delete({
            id: ObjectId(accessGroupId),
            tenantId,
            responsibleId: user._id!
          })

          response.OK('Grupo de acesso removido com sucesso!')
        } catch (error) {
          next(error)
        }
      })

    return this.router
  }
}

const accessGroupController = new AccessGroupController()
export default accessGroupController.handle()
