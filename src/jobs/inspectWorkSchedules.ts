import { WorkScheduleRepositoryImp } from '../models/WorkSchedule/WorkScheduleMongoDB'

export const inspectWorkSchedules = async () => {
  try {
    const inWorkSchedules = await WorkScheduleRepositoryImp.findAllInOfSchedule()
    const outWorkSchedules = await WorkScheduleRepositoryImp.findAllOutOfSchedule()

    console.log({ inWorkSchedules, outWorkSchedules })

    if (inWorkSchedules.length) {
      await Promise.all(
        inWorkSchedules.map(async workSchedule => {
          await WorkScheduleRepositoryImp.update({
            id: workSchedule._id!,
            tenantId: workSchedule.tenantId,
            data: {
              active: true
            }
          })
        })
      )
    }

    if (outWorkSchedules.length) {
      await Promise.all(
        outWorkSchedules.map(async workSchedule => {
          await WorkScheduleRepositoryImp.update({
            id: workSchedule._id!,
            tenantId: workSchedule.tenantId,
            data: {
              active: false
            }
          })
        })
      )
    }
  } catch (error) {

  }
}
