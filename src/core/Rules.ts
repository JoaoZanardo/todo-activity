import requestCheck from 'request-check'

import CustomResponse from '../utils/CustomResponse'
import is from '../utils/is'
import { nameValidator } from '../utils/nameValidator'
import ObjectId from '../utils/ObjectId'

export default class Rules {
  public validator

  constructor () {
    this.validator = requestCheck()
    this.validator.requiredMessage = 'Campo obrigatório!'

    this.validator.addRule('active', {
      validator: (value: string) => is.boolean(value),
      message: 'Ativo inválido. Informe um ativo válido!'
    })

    this.validator.addRule('name', {
      validator: (value: string) => nameValidator(value),
      message: 'Nome inválido. Informe um name válido!'
    })

    this.validator.addRule('accessGroupId', {
      validator: (value: string) => ObjectId(value),
      message: 'Identificador de grupo de acesso inválido. Informe um identificador válido!'
    })
  }

  public invalid (...args: Array<{ [key: string]: any, isRequiredField?: boolean } | null | undefined>): any {
    return this.validator.check(...args as any)
  }

  public validate (...args: Array<{ [key: string]: any, isRequiredField?: boolean } | null>): any {
    const invalid = this.validator.check(...args as any)
    if (invalid) throw CustomResponse.UNPROCESSABLE_ENTITY(`Campos inválidos (${invalid.length})`, invalid)
  }
}
