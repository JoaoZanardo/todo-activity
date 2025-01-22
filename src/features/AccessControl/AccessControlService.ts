import { Types } from 'mongoose'

import { IFindModelByIdProps } from '../../core/interfaces/Model'
import { IAggregatePaginate } from '../../core/interfaces/Repository'
import { AccessControlModel, AccessControlType, AccessRelease, IAccessControl, ICreateAccessControlByEquipmentIdProps, IListAccessControlsFilters } from '../../models/AccessControl/AccessControlModel'
import { AccessControlRepositoryImp } from '../../models/AccessControl/AccessControlMongoDB'
import { IAccessPoint } from '../../models/AccessPoint/AccessPointModel'
import { PersonModel } from '../../models/Person/PersonModel'
import CustomResponse from '../../utils/CustomResponse'
import { AccessPointServiceImp } from '../AccessPoint/AccessPointController'
import { EquipmentServiceImp } from '../Equipment/EquipmentController'
import { PersonServiceImp } from '../Person/PersonController'

export class AccessControlService {
  constructor (
    private accessControlRepositoryImp: typeof AccessControlRepositoryImp
  ) {
    this.accessControlRepositoryImp = accessControlRepositoryImp
  }

  async list (filters: IListAccessControlsFilters): Promise<IAggregatePaginate<IAccessControl>> {
    return await this.accessControlRepositoryImp.list(filters)
  }

  async findById ({
    id,
    tenantId
  }: IFindModelByIdProps): Promise<AccessControlModel> {
    const accessControl = await this.accessControlRepositoryImp.findById({
      id,
      tenantId
    })
    if (!accessControl) throw CustomResponse.NOT_FOUND('Controle de acesso não cadastrado!')

    return accessControl
  }

  async createByEquipmentId ({
    equipmentId,
    personId,
    tenantId
  }: ICreateAccessControlByEquipmentIdProps): Promise<AccessControlModel> {
    const accessPoint = await AccessPointServiceImp.findByEquipmentId({
      equipmentId,
      tenantId
    })

    const person = await PersonServiceImp.findById({
      id: personId,
      tenantId
    })

    if (accessPoint.object.generalExit) {
      const accessPoints = await AccessPointServiceImp.findAllByPersonTypeId({
        personTypeId: person.personTypeId,
        tenantId
      })

      if (accessPoints.length) {
        await Promise.all(
          accessPoints.map(async accessPoint => {
            if (accessPoint.equipmentsIds?.length) {
              await Promise.all(
                accessPoint.equipmentsIds.map(async equipmentId => {
                  await EquipmentServiceImp.findById({
                    id: equipmentId,
                    tenantId
                  })

                  // await EquipmentServer.removeAccess({
                  //   equipmentIp: equipment.ip,
                  //   personId
                  // })
                })
              )
            }
          })
        )
      }
    }

    const accessControlModel = new AccessControlModel({
      accessPointId: accessPoint._id!,
      accessRelease: AccessRelease.facial,
      areasIds: [],
      personId,
      personTypeId: person.personTypeId,
      tenantId,
      type: AccessControlType.entry // mocked one
    })

    return await this.accessControlRepositoryImp.create(accessControlModel)
  }

  async create (accessControl: AccessControlModel): Promise<AccessControlModel> {
    const { tenantId, accessPointId, personId, areasIds } = accessControl

    const person = await PersonServiceImp.findById({ id: personId, tenantId })

    const accessPoint = await AccessPointServiceImp.findById({ id: accessPointId, tenantId })

    await this.processAreaAccessPoints([accessPoint.object], person, tenantId)

    await Promise.all(
      areasIds.map(async areaId => {
        const accessPoints = await AccessPointServiceImp.findAllByAreaId({ areaId, tenantId })

        if (accessPoints.length) {
          await this.processAreaAccessPoints(accessPoints, person, tenantId)
        }
      })
    )

    return await this.accessControlRepositoryImp.create(accessControl)
  }

  private async processAreaAccessPoints (
    accessPoints: Array<Partial<IAccessPoint>>,
    person: PersonModel,
    tenantId: Types.ObjectId
  ) {
    const personTypeId = person.personTypeId

    await Promise.all(
      accessPoints.map(async (accessPoint) => {
        const { generalExit, personTypesIds, equipmentsIds } = accessPoint

        const isPersonTypeIncluded = personTypesIds?.some(id => id.equals(personTypeId))

        if (!generalExit && isPersonTypeIncluded && equipmentsIds?.length) {
          await this.processEquipments(equipmentsIds, person, tenantId)
        }
      })
    )
  }

  private async processEquipments (equipmentsIds: Array<Types.ObjectId>, person: PersonModel, tenantId: Types.ObjectId) {
    await Promise.all(
      equipmentsIds.map(async (equipmentId) => {
        const equipment = await EquipmentServiceImp.findById({ id: equipmentId, tenantId })
        console.log({ equipment: equipment.show })

        // await EquipmentServer.addAccess({
        //   equipmentIp: equipment.ip,
        //   personCode: person._id!,
        //   personId: person._id!,
        //   personName: person.name,
        //   personPictureUrl: person.object.picture!,
        //   initDate: DateUtils.getCurrent(),
        //   endDate: DateUtils.getDefaultEndDate(),
        //   schedules: []
        // })
      })
    )
  }
}
