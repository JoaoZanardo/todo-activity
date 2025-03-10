import { ModelAction } from '../../core/interfaces/Model'
import { AccessControlModel, AccessControlType, IAccessControlCreationServiceExecuteProps } from '../../models/AccessControl/AccessControlModel'
import { AccessControlRepositoryImp } from '../../models/AccessControl/AccessControlMongoDB'
import { PushNotificationModel, PushNotificationType } from '../../models/PushNotification/PushNotificationModel'
import { DateUtils } from '../../utils/Date'
import { AccessAreaServiceImp } from '../AccessArea/AccessAreaController'
import { AccessControlServiceImp } from '../AccessControl/AccessControlController'
import { AccessPointServiceImp } from '../AccessPoint/AccessPointController'
import { AccessReleaseServiceImp } from '../AccessRelease/AccessReleaseController'
import { AccessReleaseInvitationServiceImp } from '../AccessReleaseInvitation/AccessReleaseInvitationController'
import { AreaServiceImp } from '../Area/AreaController'
import { PersonServiceImp } from '../Person/PersonController'
import { PushNotificationServiceImp } from '../PushNotification/PushNotificationController'

class AccessControlCreationService {
  async execute ({
    personId,
    tenantId,
    userId,
    observation,
    accessPointId,
    picture,
    equipment,
    session,
    releaseType
  }: IAccessControlCreationServiceExecuteProps): Promise<AccessControlModel> {
    const [accessPoint, lastAccessRelease, person] = await Promise.all([
      AccessPointServiceImp.findById({ id: accessPointId, tenantId }),
      AccessReleaseServiceImp.findLastByPersonId({ personId, tenantId }),
      PersonServiceImp.findById({ id: personId, tenantId })
    ])

    await AccessControlServiceImp.validateAccessControlCreation({
      accessPoint,
      accessRelease: lastAccessRelease,
      tenantId,
      session
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

    const type = accessPoint.generalEntry ? AccessControlType.entry : AccessControlType.exit

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
      equipment,
      accessReleaseId: lastAccessRelease!._id!,
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
      type,
      responsible: responsible ? {
        id: responsible._id!,
        name: responsible.name
      } : undefined,
      actions: [{
        action: ModelAction.create,
        date: DateUtils.getCurrent(),
        userId
      }],
      observation,
      releaseType
    })

    const createdAccessControl = await AccessControlRepositoryImp.create(accessControl)

    if (lastAccessRelease?.accessReleaseInvitationId) {
      if (type === AccessControlType.entry) {
        const invitation = await AccessReleaseInvitationServiceImp.findById({
          id: lastAccessRelease?.accessReleaseInvitationId,
          tenantId
        })

        const userId = invitation.person?.userId

        if (userId) {
          const pushNotificationModel = new PushNotificationModel({
            title: '🚪 Entrada confirmada!',
            body: `${person.name} acabou de entrar no condomínio usando o convite que você gerou. ✅`,
            data: {
              redirect: {
                screen: 'AccessReleaseInvitation',
                params: {
                  id: invitation._id
                }
              },
              userId
            },
            tenantId,
            type: PushNotificationType.specific,
            userId
          })

          await PushNotificationServiceImp.create(pushNotificationModel)
        }
      }
    }

    return createdAccessControl
  }
}

export default new AccessControlCreationService()
