import { AccessReleaseServiceImp } from '../features/AccessRelease/AccessReleaseController'
import { TenantRepositoryImp } from '../models/Tenant/TenantMongoDB'

export const UpdateExpiringAccessReleases = async () => {
  console.log('UpdateExpiringAccessReleases')

  try {
    const tenants = await AccessReleaseServiceImp.findAllExpiringToday()

    if (tenants.length) {
      await Promise.all([
        tenants.forEach(async tenant => {
          await TenantRepositoryImp.updateById({
            id: tenant._id!,
            data: {
              active: false
            }
          })
        })
      ])
    }
  } catch (error) {

  }
}
