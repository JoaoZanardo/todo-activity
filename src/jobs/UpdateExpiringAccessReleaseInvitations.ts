import { AccessReleaseInvitationServiceImp } from '../features/AccessReleaseInvitation/AccessReleaseInvitationController'
import { AccessReleaseInvitationStatus } from '../models/AccessReleaseInvitation/AccessReleaseInvitationModel'

export const UpdateExpiringAccessReleaseInvitations = async () => {
  try {
    const accessReleasesinvitations = await AccessReleaseInvitationServiceImp.findAllExpiring()

    console.log(`UpdateExpiringAccessReleaseInvitations - ${accessReleasesinvitations.length}`)

    if (accessReleasesinvitations.length) {
      await Promise.all(
        accessReleasesinvitations.map(async (accessReleaseInvitation) => {
          await AccessReleaseInvitationServiceImp.update({
            id: accessReleaseInvitation._id!,
            data: {
              status: AccessReleaseInvitationStatus.expired
            },
            tenantId: accessReleaseInvitation.tenantId!
          })
        })
      )
    }
  } catch (error) {
    console.error(`UpdateExpiringAccessReleaseInvitationsError: ${error}`)
  }
}
