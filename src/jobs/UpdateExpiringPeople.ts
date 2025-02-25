import { PersonRepositoryImp } from '../models/Person/PersonMongoDB'

export const UpdateExpiringPeople = async () => {
  try {
    const people = await PersonRepositoryImp.findAllExpired()

    console.log(`UpdateExpiringPeople - ${people.length}`)

    if (people.length) {
      await Promise.all(
        people.map(async (person) => {
          try {
            await PersonRepositoryImp.update({
              id: person._id!,
              tenantId: person.tenantId!,
              data: {
                updationInfo: {
                  updatedData: false
                }
              }
            })
          } catch (error) {
            console.error(`UpdateExpiringPeopleError - MAP: ${error}`)
          }
        })
      )
    }
  } catch (error) {
    console.error(`UpdateExpiringPeopleError: ${error}`)
  }
}
