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

    this.validator.addRule('description', {
      validator: (value: string) => is.string(value),
      message: 'Descrição inválida. Informe uma descrição válida!'
    })

    this.validator.addRule('appAccess', {
      validator: (value: string) => is.boolean(value),
      message: 'Acesso ao App inválido!'
    })
  }
}
