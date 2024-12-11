import { TenantRepositoryImp } from '../models/Tenant/TenantMongoDB'

export const UpdateExpiringTenants = async () => {
  console.log('UpdateExpiringTenants')

  try {
    const tenants = await TenantRepositoryImp.findTenantsOlderThan7Days()

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
