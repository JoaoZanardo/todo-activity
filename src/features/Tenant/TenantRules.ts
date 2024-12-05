/* eslint-disable no-useless-constructor */
import Rules from '../../core/Rules'
import is from '../../utils/is'

export class TenantRules extends Rules {
  constructor () {
    super()

    this.validator.addRule('tenantId', {
      validator: (value: string) => is.objectId(value),
      message: 'Código de licença inválido!'
    })
  }
}
