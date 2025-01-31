import { ISynchronizeProps } from '../../models/AccessSynchronization/AccessSynchronizationModel'
import { AccessSynchronizationRepositoryImp } from '../../models/AccessSynchronization/AccessSynchronizationMongoDB'
import { DateUtils } from '../../utils/Date'
import { AccessSynchronizationServiceImp } from './AccessSynchronizationController'

process.on('message', async ({
  accessReleases,
  accessSynchronizationId,
  equipment,
  tenantId
}: ISynchronizeProps) => {
  console.log('Starting Equipment Synchronization', {
    accessReleases: accessReleases.length,
    accessSynchronizationId,
    tenantId,
    equipment
  })

  try {
    while (accessReleases.length) {
      const batch = accessReleases.splice(0, 25)

      await AccessSynchronizationServiceImp.synchronize({
        accessReleases: batch,
        accessSynchronizationId,
        equipment,
        tenantId
      })

      await AccessSynchronizationRepositoryImp.updateExecutedNumbers({
        id: accessSynchronizationId,
        tenantId,
        number: 25
      })
    }

    await AccessSynchronizationRepositoryImp.update({
      id: accessSynchronizationId!,
      tenantId,
      data: {
        endDate: DateUtils.getCurrent(),
        finished: true
      }
    })

    if (process.send) {
      process.send({ status: 'completed' })
    }
  } catch (error: any) {
    if (process.send) {
      process.send({
        status: 'error',
        error: error?.message
      })
    }
  }
})
