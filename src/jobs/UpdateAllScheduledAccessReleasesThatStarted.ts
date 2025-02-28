import database from '../config/database'
import { ModelAction } from '../core/interfaces/Model'
import { AccessReleaseServiceImp } from '../features/AccessRelease/AccessReleaseController'
import { AccessReleaseStatus, IAccessRelease } from '../models/AccessRelease/AccessReleaseModel'
import { AccessReleaseRepositoryImp } from '../models/AccessRelease/AccessReleaseMongoDB'
import { DateUtils } from '../utils/Date'

export const UpdateAllScheduledAccessReleasesThatStarted = async () => {
  const session = await database.startSession()
  session.startTransaction()

  try {
    const accessReleases = await AccessReleaseRepositoryImp.findAllScheduledAccessReleasesThatStarted()

    console.log(`UpdateAllScheduledAccessReleasesThatStarted - ${accessReleases.length}`)

    if (accessReleases.length) {
      await Promise.all([
        accessReleases.map(async accessRelease => {
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
                actions: [
                  ...accessRelease.actions!,
                  {
                    action: ModelAction.update,
                    date: DateUtils.getCurrent()
                  }
                ],
                active: false,
                status: AccessReleaseStatus.conflict
              }
            })
          } else {
            await AccessReleaseServiceImp.syncPersonAccessWithEquipments({
              accessRelease: accessRelease as IAccessRelease,
              personId: accessRelease.personId!,
              tenantId,
              session
            })

            if (DateUtils.isToday(accessRelease.endDate!)) {
              const newSession = await database.startSession()
              newSession.startTransaction()

              try {
                await AccessReleaseServiceImp.scheduleDisable({
                  endDate: accessRelease.endDate!,
                  accessReleaseId: accessRelease._id!,
                  tenantId,
                  session: newSession,
                  status: AccessReleaseStatus.expired
                })

                await newSession.commitTransaction()
                newSession.endSession()
              } catch (error) {
                newSession.endSession()

                console.error('Erro ao remover acessos do equipamentos:', error)
              }
            }
          }
        })
      ])
    }

    await session.commitTransaction()
    session.endSession()
  } catch (error) {
    session.endSession()

    console.log(`UpdateAllScheduledAccessReleasesThatStartedError: ${error}`)
  }
}
