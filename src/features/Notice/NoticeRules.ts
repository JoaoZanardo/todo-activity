/* eslint-disable no-useless-constructor */
import Rules from '../../core/Rules'
import is from '../../utils/is'

export class NoticeRules extends Rules {
  constructor () {
    super()

    this.validator.addRule('title', {
      validator: (value: string) => is.string(value),
      message: 'Título de aviso inválido. Informe um título válido!'
    })

    this.validator.addRule('type', {
      validator: (value: string) => is.string(value),
      message: 'Tipo de aviso inválido. Informe um tipo válido!'
    })

    this.validator.addRule('initDate', {
      validator: (value: string) => is.date(value),
      message: 'Data inicial inválida, informe uma data válida!'
    })

    this.validator.addRule('endDate', {
      validator: (value: string) => is.date(value),
      message: 'Data final inválida, informe uma data válida!'

    })

    this.validator.addRule('observation', {
      validator: (value: string) => is.string(value),
      message: 'Observação inválida. Informe um observação válida'
    })
  }
}
