import { WorkScheduleRepositoryImp } from '../models/WorkSchedule/WorkScheduleMongoDB'

export const inspectWorkSchedules = async () => {
  console.log('inspectWorkSchedules')

  try {
    const workSchedules = await WorkScheduleRepositoryImp.findAllInOfSchedule()

    console.log({ workSchedules })

    if (workSchedules.length) {
      // Liberar acesso
    }
  } catch (error) {

  }
}
