import { AccessPointServiceImp } from '../features/AccessPoint/AccessPointController'
import { AccessReleaseServiceImp } from '../features/AccessRelease/AccessReleaseController'
import { PersonServiceImp } from '../features/Person/PersonController'
import { AccessReleaseStatus } from '../models/AccessRelease/AccessReleaseModel'
import { AccessReleaseRepositoryImp } from '../models/AccessRelease/AccessReleaseMongoDB'
import CustomResponse from '../utils/CustomResponse'

export const UpdateStartingAccessReleases = async () => {
  try {
    const accessReleases = await AccessReleaseServiceImp.findAllStartingToday()

    console.log(`UpdateStartingAccessReleases - ${accessReleases.length}`)

    if (accessReleases.length) {
      await Promise.all([
        accessReleases.forEach(async accessRelease => {
          const tenantId = accessRelease.tenantId!

          const lastAccessRelease = await AccessReleaseServiceImp.findLastByPersonId({
            personId: accessRelease.personId!,
            tenantId
          })

          if (
            lastAccessRelease &&
            lastAccessRelease.status === AccessReleaseStatus.active
          ) {
            await AccessReleaseRepositoryImp.update({
              id: accessRelease._id!,
              tenantId,
              data: {
                active: false,
                status: AccessReleaseStatus.conflict
              }
            })

            throw CustomResponse.CONFLICT('Essa pessoa já possui uma liberação de acesso!')
          }

          const person = await PersonServiceImp.findById({
            id: accessRelease.personId!,
            tenantId
          })

          await Promise.all(
            accessRelease.areasIds!.map(async areaId => {
              const accessPoints = await AccessPointServiceImp.findAllByAreaId({
                areaId,
                tenantId
              })

              if (accessPoints.length) {
                await AccessReleaseServiceImp.processAreaAccessPoints({
                  accessPoints,
                  endDate: accessRelease.endDate!,
                  person,
                  tenantId
                })
              }
            })
          )

          await AccessReleaseRepositoryImp.update({
            id: accessRelease._id!,
            tenantId,
            data: {
              status: AccessReleaseStatus.active
            }
          })
        })
      ])
    }
  } catch (error) {

  }
}
