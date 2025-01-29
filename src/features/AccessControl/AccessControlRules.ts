/* eslint-disable no-useless-constructor */
import Rules from '../../core/Rules'
import is from '../../utils/is'

export class AccessControlRules extends Rules {
  constructor () {
    super()

    this.validator.addRule('equipmentIp', {
      validator: (value: string) => is.string(value),
      message: 'IP do equipamento inválido. Informe um IP válido!'
    })
  }
}
