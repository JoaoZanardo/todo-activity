import { WorkScheduleRepositoryImp } from '../models/WorkSchedule/WorkScheduleMongoDB'

export const inspectWorkSchedules = async () => {
  console.log('inspectWorkSchedules')

  try {
    const inWorkSchedules = await WorkScheduleRepositoryImp.findAllInOfSchedule()
    const outWorkSchedules = await WorkScheduleRepositoryImp.findAllInOfSchedule()

    console.log({ inWorkSchedules, outWorkSchedules })

    if (inWorkSchedules.length) {
      // Liberar acesso
    }
  } catch (error) {

  }
}
