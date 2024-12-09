import Rules from '../../core/Rules'
import is from '../../utils/is'

export class AccessGroupRules extends Rules {
  constructor () {
    super()

    this.validator.addRule('name', {
      validator: (value: string) => is.string(value),
      message: 'Nome inválido. Informe um nome válido!'
    })

    this.validator.addRule('modules', {
      validator: (value: string) => is.array(value),
      message: 'Módulos inválidos. Informe módulos válidos!'
    })

    this.validator.addRule('home', {
      validator: (value: string) => is.object(value),
      message: 'Módulo inicial inválido. Informe um módulo válido!'
    })
  }
}
