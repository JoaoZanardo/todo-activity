/* eslint-disable no-useless-constructor */
import Rules from '../../core/Rules'
import is from '../../utils/is'

export class PersonRules extends Rules {
  constructor () {
    super()

    this.validator.addRule('address', {
      validator: (value: string) => is.string(value),
      message: 'Endereço inálido. Informe um endereço válido!'
    })

    this.validator.addRule('contractEndDate', {
      validator: (value: string) => is.date(value),
      message: 'Data de término de contrato inválida. Informe uma data válida!'
    })

    this.validator.addRule('email', {
      validator: (value: string) => is.email(value),
      message: 'Email inválido. Informe um email válido!'
    })

    this.validator.addRule('name', {
      validator: (value: string) => is.string(value),
      message: 'Nome inválido. Informe um nome válido!'
    })

    this.validator.addRule('observation', {
      validator: (value: string) => is.string(value),
      message: 'Observação inválida. Informe uma observação válida!'
    })

    this.validator.addRule('phone', {
      validator: (value: string) => is.string(value),
      message: 'Telefone inválido. Informe um telefone válido!'
    })
  }
}
