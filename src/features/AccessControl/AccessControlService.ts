import { Types } from 'mongoose'
import { AccessReleaseRepositoryImp } from 'src/models/AccessRelease/AccessReleaseMongoDB'

import { IFindModelByIdProps } from '../../core/interfaces/Model'
import { IAggregatePaginate } from '../../core/interfaces/Repository'
import { AccessControlModel, AccessControlType, IAccessControl, ICreateAccessControlByEquipmentIdProps, IListAccessControlsFilters } from '../../models/AccessControl/AccessControlModel'
import { AccessControlRepositoryImp } from '../../models/AccessControl/AccessControlMongoDB'
import { PersonModel } from '../../models/Person/PersonModel'
import EquipmentServer from '../../services/EquipmentServer'
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

    const accessRelease = await AccessReleaseRepositoryImp.findLastByPersonId({
      personId,
      tenantId
    })

    if (!accessRelease) throw CustomResponse.BAD_REQUEST('Pessoa não possui liberação de acesso!')

    if (accessPoint.object.generalExit) await this.removeAllAccessFromPerson(person, tenantId)

    const accessControlModel = new AccessControlModel({
      accessPointId: accessPoint._id!,
      personId,
      personTypeId: person.personTypeId,
      tenantId,
      type: AccessControlType.entry, // mocked one
      accessReleaseId: accessRelease._id!
    })

    return await this.accessControlRepositoryImp.create(accessControlModel)
  }

  async create (accessControl: AccessControlModel): Promise<AccessControlModel> {
    return await this.accessControlRepositoryImp.create(accessControl)
  }

  async removeAllAccessFromPerson (person: PersonModel, tenantId: Types.ObjectId) {
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
                const equipment = await EquipmentServiceImp.findById({
                  id: equipmentId,
                  tenantId
                })

                await EquipmentServer.removeAccess({
                  equipmentIp: equipment.ip,
                  personId: person._id!
                })
              })
            )
          }
        })
      )
    }
  }
}
