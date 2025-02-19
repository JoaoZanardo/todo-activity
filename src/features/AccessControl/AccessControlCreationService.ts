import { ModelAction } from '../../core/interfaces/Model'
import { AccessControlModel, AccessControlType, IAccessControlCreationServiceExecuteProps } from '../../models/AccessControl/AccessControlModel'
import { AccessControlRepositoryImp } from '../../models/AccessControl/AccessControlMongoDB'
import { DateUtils } from '../../utils/Date'
import { AccessAreaServiceImp } from '../AccessArea/AccessAreaController'
import { AccessControlServiceImp } from '../AccessControl/AccessControlController'
import { AccessPointServiceImp } from '../AccessPoint/AccessPointController'
import { AccessReleaseServiceImp } from '../AccessRelease/AccessReleaseController'
import { AreaServiceImp } from '../Area/AreaController'
import { PersonServiceImp } from '../Person/PersonController'

class AccessControlCreationService {
  async execute ({
    accessReleaseId,
    personId,
    accessPointId,
    picture,
    tenantId,
    userId,
    observation
  }: IAccessControlCreationServiceExecuteProps): Promise<AccessControlModel> {
    try {
      const [accessPoint, lastAccessRelease, person] = await Promise.all([
        AccessPointServiceImp.findById({ id: accessPointId, tenantId }),
        AccessReleaseServiceImp.findLastByPersonId({ personId, tenantId }),
        PersonServiceImp.findById({ id: personId, tenantId })
      ])

      await AccessControlServiceImp.validateAccessControlCreation({
        accessPoint,
        accessRelease: lastAccessRelease,
        tenantId
      })

      const responsible = lastAccessRelease?.responsible

      const [area, accessArea] = await Promise.all([
        accessPoint.areaId ? await AreaServiceImp.findById({
          id: accessPoint.areaId,
          tenantId
        }) : undefined,
        accessPoint.accessAreaId ? await AccessAreaServiceImp.findById({
          id: accessPoint.accessAreaId,
          tenantId
        }) : undefined
      ])

      const accessControl = new AccessControlModel({
        accessPoint: {
          id: accessPoint._id!,
          name: accessPoint.name,
          area: area ? {
            id: area._id!,
            name: area.name
          } : undefined,
          accessArea: accessArea ? {
            id: accessArea._id!,
            name: accessArea.name
          } : undefined
        },
        accessReleaseId,
        person: {
          id: person._id!,
          name: person.name,
          picture: picture ?? lastAccessRelease?.object.picture,
          personType: {
            id: lastAccessRelease?.personType?._id!,
            name: lastAccessRelease!.personType?.name!
          },
          personTypeCategory: {
            id: lastAccessRelease?.personTypeCategory?._id!,
            name: lastAccessRelease!.personTypeCategory?.name
          }
        },
        tenantId,
        type: AccessControlType.entry,
        responsible: responsible ? {
          id: responsible._id!,
          name: responsible.name
        } : undefined,
        actions: [{
          action: ModelAction.create,
          date: DateUtils.getCurrent(),
          userId
        }],
        observation
      })

      return await AccessControlRepositoryImp.create(accessControl)
    } catch (error) {
      console.error('Error creating AccessControl:', error)
      throw new Error('Failed to create AccessControl')
    }
  }
}

export default new AccessControlCreationService()
