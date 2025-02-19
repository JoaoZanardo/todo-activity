/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import to from 'await-to-js'

import { IFindModelByIdProps } from '../../core/interfaces/Model'
import { IAggregatePaginate } from '../../core/interfaces/Repository'
import { AccessControlModel, IAccessControl, ICreateAccessControlByEquipmentIpProps, IListAccessControlsFilters, IValidateAccessControlCreationProps } from '../../models/AccessControl/AccessControlModel'
import { AccessControlRepositoryImp } from '../../models/AccessControl/AccessControlMongoDB'
import { AccessReleaseStatus } from '../../models/AccessRelease/AccessReleaseModel'
import EquipmentServer from '../../services/EquipmentServer'
import CustomResponse from '../../utils/CustomResponse'
import { AccessPointServiceImp } from '../AccessPoint/AccessPointController'
import { AccessReleaseServiceImp } from '../AccessRelease/AccessReleaseController'
import { EquipmentServiceImp } from '../Equipment/EquipmentController'
import { PersonServiceImp } from '../Person/PersonController'
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
    tenantId
  }: ICreateAccessControlByEquipmentIpProps): Promise<AccessControlModel> {
    const equipment = await EquipmentServiceImp.findByIp({
      ip: equipmentIp,
      tenantId
    })

    const accessPoint = await AccessPointServiceImp.findByEquipmentId({
      equipmentId: equipment._id!,
      tenantId
    })

    const person = await PersonServiceImp.findById({
      id: personId,
      tenantId
    })

    const lastAccessRelease = await AccessReleaseServiceImp.findLastByPersonId({
      personId,
      tenantId
    })

    await this.validateAccessControlCreation({
      accessPoint,
      accessRelease: lastAccessRelease,
      tenantId
    })

    return await AccessControlCreationService.execute({
      accessPointId: accessPoint._id!,
      accessReleaseId: lastAccessRelease!._id!,
      personId,
      tenantId,
      picture: lastAccessRelease!.object.picture
    })
  }

  async validateAccessControlCreation ({
    accessRelease,
    accessPoint,
    tenantId
  }: IValidateAccessControlCreationProps) {
    if (
      !accessRelease ||
      accessRelease.status !== AccessReleaseStatus.active
    ) throw CustomResponse.CONFLICT('Essa pessoa não possui uma liberação de acesso!')

    if (accessRelease.object.singleAccess && !accessRelease.accessPointId) {
      throw CustomResponse.BAD_REQUEST('Ponto de accesso não definido na liberação de acesso!')
    }

    if (accessRelease.object.singleAccess && accessRelease.accessPointId?.equals(accessPoint._id!)) {
      const person = await PersonServiceImp.findById({
        id: accessRelease.personId,
        tenantId
      })

      Promise.all(
        accessPoint.object.equipmentsIds.map(async equipmentId => {
          const equipment = await EquipmentServiceImp.findById({
            id: equipmentId,
            tenantId
          })

          const [error, _] = await to(
            EquipmentServer.removeAccess({
              equipmentIp: equipment.ip,
              personId: person._id!
            })
          )
        })
      )
    }

    if (accessPoint.object.generalExit && accessRelease.object.singleAccess) {
      await Promise.all([
        AccessReleaseServiceImp.disable({
          id: accessRelease._id!,
          tenantId,
          status: AccessReleaseStatus.disabled
        })
      ])
    }
  }
}
