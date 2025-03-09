import Rules from '../../core/Rules'
import is from '../../utils/is'

export class UserRules extends Rules {
  constructor () {
    super()

    this.validator.addRule('email', {
      validator: (value: string) => is.email(value),
      message: 'Email inválido. Informe um email válido!'
    })

    this.validator.addRule('login', {
      validator: (value: string) => is.string(value),
      message: 'Login inválido. Informe um login válido!'
    })

    this.validator.addRule('password', {
      validator: (value: string) => is.string(value),
      message: 'Senha inválida. Informe uma senha válida!'
    })

    this.validator.addRule('passwordConfirmation', {
      validator: (value: string) => is.string(value),
      message: 'Confirmação de senha inválida. Informe uma senha válida!'
    })
    this.validator.addRule('match', {
      validator: (value: Array<string>) => value[0] === value[1],
      message: 'As senhas não coincidem!'
    })
  }
}
