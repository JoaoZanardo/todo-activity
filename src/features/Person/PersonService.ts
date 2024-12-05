import { IListPersonsFilters } from '../../models/Person/PersonModel'
import { PersonRepositoryImp } from '../../models/Person/PersonMongoDB'

export class PersonService {
  constructor (
    private personRepositoryImp: typeof PersonRepositoryImp
  ) {
    this.personRepositoryImp = personRepositoryImp
  }

  async list (filters: IListPersonsFilters) {
    return await this.personRepositoryImp.list(filters)
  }
}
