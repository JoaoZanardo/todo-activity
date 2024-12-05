import requestCheck from 'request-check'

import CustomResponse from '../utils/CustomResponse'
import is from '../utils/is'

export default class Rules {
  public validator

  constructor () {
    this.validator = requestCheck()
    this.validator.requiredMessage = 'Campo obrigatório!'

    this.validator.addRule('active', {
      validator: (value: string) => is.boolean(value),
      message: 'Ativo inválido. Informe um ativo válido!'
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
