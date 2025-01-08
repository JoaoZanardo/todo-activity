import { EquipmentServiceImp } from 'src/features/Equipment/EquipmentController'
import { PersonServiceImp } from 'src/features/Person/PersonController'

import { IFindModelByIdProps } from '../../core/interfaces/Model'
import { IAggregatePaginate } from '../../core/interfaces/Repository'
import { AccessControlModel, IAccessControl, IListAccessControlsFilters } from '../../models/AccessControl/AccessControlModel'
import { AccessControlRepositoryImp } from '../../models/AccessControl/AccessControlMongoDB'
import EquipmentServer from '../../services/EquipmentServer'
import CustomResponse from '../../utils/CustomResponse'

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
    if (!accessControl) throw CustomResponse.NOT_FOUND('Categoria de tipo de pessoa não cadastrada!')

    return accessControl
  }

  async create (accessControl: AccessControlModel): Promise<AccessControlModel> {
    const createdAccessControl = await this.accessControlRepositoryImp.create(accessControl)

    const person = await PersonServiceImp.findById({
      id: createdAccessControl.personId,
      tenantId: createdAccessControl.tenantId
    })

    // Storage the equipment ip into Access Controll

    const equipment = await EquipmentServiceImp.findById({
      id: accessControl.equipmentId,
      tenantId: accessControl.tenantId
    })

    await EquipmentServer.AddAccess({
      equipmentIp: equipment.ip,
      personCode: person._id!,
      personId: person._id!,
      personName: person.name,
      personPictureUrl: person.object.picture!
    })

    return createdAccessControl
  }
}
