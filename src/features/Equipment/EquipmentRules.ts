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

    this.validator.addRule('type', {
      validator: (value: string) => is.string(value),
      message: 'Tipo inválido. Informe um tipo válido!'
    })

    this.validator.addRule('ip', {
      validator: (value: string) => is.string(value),
      message: 'Ip inálido. Informe uma ip válido!'
    })

    this.validator.addRule('brand', {
      validator: (value: string) => is.string(value),
      message: 'Marca inválida!'
    })

    this.validator.addRule('pattern', {
      validator: (value: string) => is.string(value),
      message: 'Modelo inválido. Informe um modelo válido'
    })
  }
}
