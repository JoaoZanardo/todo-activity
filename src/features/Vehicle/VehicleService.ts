/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { IFindModelByIdProps, ModelAction } from '../../core/interfaces/Model'
import { IAggregatePaginate } from '../../core/interfaces/Repository'
import { IDeleteVehicleProps, IFIndVehicleByPlateProps, IListVehiclesFilters, IUpdateVehicleProps, IVehicle, VehicleModel } from '../../models/Vehicle/VehicleModel'
import { VehicleRepositoryImp } from '../../models/Vehicle/VehicleMongoDB'
import CustomResponse from '../../utils/CustomResponse'
import { DateUtils } from '../../utils/Date'

export class VehicleService {
  constructor (
    private vehicleRepositoryImp: typeof VehicleRepositoryImp
  ) {
    this.vehicleRepositoryImp = vehicleRepositoryImp
  }

  async list (filters: IListVehiclesFilters): Promise<IAggregatePaginate<IVehicle>> {
    return await this.vehicleRepositoryImp.list(filters)
  }

  async findById ({
    id,
    tenantId
  }: IFindModelByIdProps): Promise<VehicleModel> {
    const vehicle = await this.vehicleRepositoryImp.findById({
      id,
      tenantId
    })
    if (!vehicle) throw CustomResponse.NOT_FOUND('Veículo não cadastrado!')

    return vehicle
  }

  async findByPlate ({
    plate,
    tenantId
  }: IFIndVehicleByPlateProps): Promise<VehicleModel> {
    const vehicle = await this.vehicleRepositoryImp.findByPlate({
      plate,
      tenantId
    })
    if (!vehicle) throw CustomResponse.NOT_FOUND('Veículo não cadastrado!')

    return vehicle
  }

  async create (vehicle: VehicleModel): Promise<VehicleModel> {
    await this.validateDuplicatedPlate(vehicle)

    return await this.vehicleRepositoryImp.create(vehicle)
  }

  async update ({
    id,
    tenantId,
    responsibleId,
    data
  }: IUpdateVehicleProps): Promise<void> {
    const vehicle = await this.findById({
      id,
      tenantId
    })

    const { plate } = data

    if (plate && plate !== vehicle.plate) {
      await this.validateDuplicatedPlate({
        plate,
        tenantId
      })
    }

    const updated = await this.vehicleRepositoryImp.update({
      id,
      tenantId,
      data: {
        ...data,
        actions: [
          ...vehicle.actions!,
          (
            data.deletionDate ? {
              action: ModelAction.delete,
              date: DateUtils.getCurrent(),
              userId: responsibleId
            } : {
              action: ModelAction.update,
              date: DateUtils.getCurrent(),
              userId: responsibleId
            }
          )
        ]
      }
    })

    if (!updated) {
      throw CustomResponse.INTERNAL_SERVER_ERROR('Ocorreu um erro ao tentar atualizar veículo!', {
        vehicleId: id
      })
    }
  }

  async delete ({
    id,
    tenantId,
    responsibleId
  }: IDeleteVehicleProps) {
    const vehicle = await this.findById({
      id,
      tenantId
    })

    if (vehicle.object.deletionDate) {
      throw CustomResponse.CONFLICT('Veículo já removido!', {
        vehicleId: id
      })
    }

    return await this.update({
      id,
      tenantId,
      data: {
        active: false,
        deletionDate: DateUtils.getCurrent()
      },
      responsibleId
    })
  }

  private async validateDuplicatedPlate ({
    plate,
    tenantId
  }: IFIndVehicleByPlateProps): Promise<void> {
    const exists = await this.vehicleRepositoryImp.findByPlate({
      plate,
      tenantId
    })

    if (exists) throw CustomResponse.CONFLICT('Placa de veículo já cadastrada!')
  }
}
