/* eslint-disable no-useless-constructor */
import Rules from '../../core/Rules'
import is from '../../utils/is'

export class AccessPointRules extends Rules {
  constructor () {
    super()

    this.validator.addRule('name', {
      validator: (value: string) => is.string(value),
      message: 'Nome inválido. Informe um nome válido!'
    })

    this.validator.addRule('manualAccess', {
      validator: (value: string) => is.boolean(value),
      message: 'Acesso manual inválido!'
    })
  }
}
