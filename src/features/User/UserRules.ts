import Rules from '../../core/Rules'
import is from '../../utils/is'

export class UserRules extends Rules {
  constructor () {
    super()

    this.validator.addRule('email', {
      validator: (value: string) => is.email(value),
      message: 'Email inválido. Informe um email válido!'
    })
  }
}
