import { AccessReleaseInvitationGroupServiceImp } from '../features/AccessReleaseInvitationGroup/AccessReleaseInvitationGroupController'
import { AccessReleaseInvitationGroupRepositoryImp } from '../models/AccessReleaseInvitationGroup/AccessReleaseInvitationGroupMongoDB'

export const UpdateExpiringAccessReleaseInvitationGroups = async () => {
  try {
    const accessReleasesinvitationGroups = await AccessReleaseInvitationGroupRepositoryImp.findAllExpiring()

    console.log(`UpdateExpiringAccessReleaseInvitationGroups - ${accessReleasesinvitationGroups.length}`)

    if (accessReleasesinvitationGroups.length) {
      await Promise.all(
        accessReleasesinvitationGroups.map(async (accessReleasesinvitationGroup) => {
          await AccessReleaseInvitationGroupServiceImp.update({
            id: accessReleasesinvitationGroup._id!,
            data: {
              expired: true
            },
            tenantId: accessReleasesinvitationGroup.tenantId!
          })
        })
      )
    }
  } catch (error) {
    console.error(`UpdateExpiringAccessReleaseInvitationGroupsError: ${error}`)
  }
}
