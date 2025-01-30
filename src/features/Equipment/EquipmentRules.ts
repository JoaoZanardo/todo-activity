/* eslint-disable no-useless-constructor */
import Rules from '../../core/Rules'
import is from '../../utils/is'

export class EquipmentRules extends Rules {
  constructor () {
    super()

    this.validator.addRule('serialNumber', {
      validator: (value: string) => is.string(value),
      message: 'Número de série inválido. Informe um número válido!'
    })

    this.validator.addRule('ip', {
      validator: (value: string) => is.string(value),
      message: 'Ip inválido. Informe um ip válido!'
    })

    this.validator.addRule('description', {
      validator: (value: string) => is.string(value),
      message: 'Descrição inválida, informe uma descrição válida!'
    })

    this.validator.addRule('pattern', {
      validator: (value: string) => is.object(value),
      message: 'Modelo inválido. Informe um modelo válido'
    })

    this.validator.addRule('name', {
      validator: (value: string) => is.string(value),
      message: 'Nome inválido. Informe um nome válido'
    })
  }
}
