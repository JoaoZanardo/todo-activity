/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { IFindModelByIdProps } from '../../core/interfaces/Model'
import { IAggregatePaginate } from '../../core/interfaces/Repository'
import { AccessControlModel, IAccessControl, ICreateAccessControlByEquipmentIpProps, IListAccessControlsFilters, IValidateAccessControlCreationProps } from '../../models/AccessControl/AccessControlModel'
import { AccessControlRepositoryImp } from '../../models/AccessControl/AccessControlMongoDB'
import { AccessReleaseStatus, RemoveAccessesFromPersonType } from '../../models/AccessRelease/AccessReleaseModel'
import CustomResponse from '../../utils/CustomResponse'
import { AccessPointServiceImp } from '../AccessPoint/AccessPointController'
import { AccessReleaseServiceImp } from '../AccessRelease/AccessReleaseController'
import { EquipmentServiceImp } from '../Equipment/EquipmentController'
import AccessControlCreationService from './AccessControlCreationService'

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

  async createByEquipmentIp ({
    equipmentIp,
    personId,
    tenantId,
    session
  }: ICreateAccessControlByEquipmentIpProps): Promise<AccessControlModel> {
    const equipment = await EquipmentServiceImp.findByIp({
      ip: equipmentIp,
      tenantId
    })

    const accessPoint = await AccessPointServiceImp.findByEquipmentId({
      equipmentId: equipment._id!,
      tenantId
    })

    return await AccessControlCreationService.execute({
      personId,
      tenantId,
      accessPointId: accessPoint._id!,
      equipment: {
        id: equipment._id,
        ip: equipment.ip,
        name: equipment.name
      },
      session
    })
  }

  async validateAccessControlCreation ({
    accessRelease,
    accessPoint,
    tenantId,
    session
  }: IValidateAccessControlCreationProps) {
    if (
      !accessRelease ||
      accessRelease.status !== AccessReleaseStatus.active
    ) throw CustomResponse.CONFLICT('Essa pessoa não possui uma liberação de acesso!')

    if (accessRelease.singleAccess) {
      if (accessPoint.generalEntry) {
        await Promise.all([
          AccessReleaseServiceImp.disable({
            id: accessRelease._id!,
            tenantId,
            status: AccessReleaseStatus.disabled,
            type: RemoveAccessesFromPersonType.generalEntries,
            session
          })
        ])
      }

      if (accessPoint.generalExit) {
        await Promise.all([
          AccessReleaseServiceImp.disable({
            id: accessRelease._id!,
            tenantId,
            status: AccessReleaseStatus.disabled,
            type: RemoveAccessesFromPersonType.all,
            session
          })
        ])
      }
    }
  }
}
