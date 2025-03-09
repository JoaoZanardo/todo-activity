import { NextFunction, Request, Response, Router } from 'express'

import { Controller } from '../../core/Controller'
import { ModelAction } from '../../core/interfaces/Model'
import Rules from '../../core/Rules'
import { permissionAuthMiddleware } from '../../middlewares/permissionAuth'
import { Permission } from '../../models/AccessGroup/AccessGroupModel'
import { VehicleModel } from '../../models/Vehicle/VehicleModel'
import { VehicleRepositoryImp } from '../../models/Vehicle/VehicleMongoDB'
import { DateUtils } from '../../utils/Date'
import ObjectId from '../../utils/ObjectId'
import { VehicleRules } from './VehicleRules'
import { VehicleService } from './VehicleService'

export const VehicleServiceImp = new VehicleService(VehicleRepositoryImp)

class VehicleController extends Controller {
  protected rules: Rules = new VehicleRules()

  handle (): Router {
    this.router.get(
      '/',
      permissionAuthMiddleware(Permission.read),
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const { tenantId } = request

          const filters = VehicleModel.listFilters({
            tenantId,
            ...request.query
          })

          const vehicles = await VehicleServiceImp.list(filters)

          response.OK('Veículos encontrados com sucesso!', {
            vehicles
          })
        } catch (error) {
          next(error)
        }
      })

    this.router.get(
      '/one/:vehicleId',
      permissionAuthMiddleware(Permission.read),
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const { tenantId } = request

          const { vehicleId } = request.params

          this.rules.validate(
            { vehicleId }
          )

          const vehicle = await VehicleServiceImp.findById({
            id: ObjectId(vehicleId),
            tenantId
          })

          response.OK('Veículo encontrado com sucesso!', {
            vehicle: vehicle.show
          })
        } catch (error) {
          next(error)
        }
      })
    this.router.get(
      '/one/plate/:plate',
      permissionAuthMiddleware(Permission.read),
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const { tenantId } = request

          const { plate } = request.params

          this.rules.validate(
            { plate }
          )

          const vehicle = await VehicleServiceImp.findByPlate({
            plate,
            tenantId
          })

          response.OK('Veículo encontrado com sucesso!', {
            vehicle: vehicle.show
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
            description,
            personId,
            plate,
            brand,
            chassis,
            color,
            detranVin,
            gasGrade,
            modelYear,
            factoryVin,
            manufactureYear,
            pattern,
            vehicleType,
            active
          } = request.body

          this.rules.validate(
            { personId },
            { plate },
            { brand, isRequiredField: false },
            { chassis, isRequiredField: false },
            { color, isRequiredField: false },
            { detranVin, isRequiredField: false },
            { gasGrade, isRequiredField: false },
            { modelYear, isRequiredField: false },
            { factoryVin, isRequiredField: false },
            { manufactureYear, isRequiredField: false },
            { pattern, isRequiredField: false },
            { vehicleType, isRequiredField: false }
          )

          const vehicleModel = new VehicleModel({
            tenantId,
            actions: [{
              action: ModelAction.create,
              date: DateUtils.getCurrent(),
              userId
            }],
            description,
            active,
            personId,
            plate,
            brand,
            chassis,
            color,
            detranVin,
            gasGrade,
            modelYear,
            factoryVin,
            manufactureYear,
            pattern,
            vehicleType
          })

          const vehicle = await VehicleServiceImp.create(vehicleModel)

          response.CREATED('Veículo cadastrado com sucesso!', {
            vehicle: vehicle.show
          })
        } catch (error) {
          next(error)
        }
      })

    this.router.patch(
      '/:vehicleId',
      permissionAuthMiddleware(Permission.update),
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const { tenantId, userId } = request

          const { vehicleId } = request.params

          const {
            description,
            plate,
            brand,
            chassis,
            color,
            detranVin,
            gasGrade,
            modelYear,
            factoryVin,
            manufactureYear,
            pattern,
            vehicleType,
            active
          } = request.body

          this.rules.validate(
            { description, isRequiredField: false },
            { plate, isRequiredField: false },
            { brand, isRequiredField: false },
            { chassis, isRequiredField: false },
            { color, isRequiredField: false },
            { detranVin, isRequiredField: false },
            { gasGrade, isRequiredField: false },
            { modelYear, isRequiredField: false },
            { factoryVin, isRequiredField: false },
            { manufactureYear, isRequiredField: false },
            { pattern, isRequiredField: false },
            { vehicleType, isRequiredField: false },
            { active, isRequiredField: false }
          )

          await VehicleServiceImp.update({
            id: ObjectId(vehicleId),
            tenantId,
            data: {
              description,
              plate,
              brand,
              chassis,
              color,
              detranVin,
              gasGrade,
              modelYear,
              factoryVin,
              manufactureYear,
              pattern,
              vehicleType,
              active
            },
            responsibleId: userId
          })

          response.OK('Veículo atualizado com sucesso!')
        } catch (error) {
          next(error)
        }
      })

    this.router.delete(
      '/:vehicleId',
      permissionAuthMiddleware(Permission.delete),
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const { tenantId, userId } = request

          const { vehicleId } = request.params

          this.rules.validate(
            { vehicleId }
          )

          await VehicleServiceImp.delete({
            id: ObjectId(vehicleId),
            tenantId,
            responsibleId: userId
          })

          response.OK('Veículo removido com sucesso!')
        } catch (error) {
          next(error)
        }
      })

    return this.router
  }
}

const vehicleController = new VehicleController()
export default vehicleController.handle()
