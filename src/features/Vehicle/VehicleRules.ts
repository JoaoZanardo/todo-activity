/* eslint-disable no-useless-constructor */
import Rules from '../../core/Rules'
import is from '../../utils/is'

export class VehicleRules extends Rules {
  constructor () {
    super()

    this.validator.addRule('vehicleType', {
      validator: (value: string) => is.string(value),
      message: 'Tipo de veículo inválido. Informe um tipo válido'
    })

    this.validator.addRule('pattern', {
      validator: (value: string) => is.string(value),
      message: 'Modelo inválido. Informe um modelo válido'
    })

    this.validator.addRule('manufactureYear', {
      validator: (value: string) => is.string(value),
      message: 'Ano de fabricação inválido. Informe um ano válido'
    })

    this.validator.addRule('factoryVin', {
      validator: (value: string) => is.string(value),
      message: 'Código de fabricação inválido. Informe um código válido'
    })

    this.validator.addRule('modelYear', {
      validator: (value: string) => is.string(value),
      message: 'Ano do modelo inválido. Informe um ano válido'
    })

    this.validator.addRule('gasGrade', {
      validator: (value: string) => is.string(value),
      message: 'Grade de combustível inválido. Informe uma grade válida'
    })

    this.validator.addRule('detranVin', {
      validator: (value: string) => is.string(value),
      message: 'Código do Detran inválido. Informe um código válido'
    })

    this.validator.addRule('description', {
      validator: (value: string) => is.string(value),
      message: 'Descrição inválida. Informe uma descrição válida'
    })

    this.validator.addRule('plate', {
      validator: (value: string) => is.string(value),
      message: 'Placainválida. Informe uma placa válida'
    })

    this.validator.addRule('brand', {
      validator: (value: string) => is.string(value),
      message: 'Marca inválida. Informe uma marca válida'
    })

    this.validator.addRule('chassis', {
      validator: (value: string) => is.string(value),
      message: 'Chassi inválido. Informe um chassi válido'
    })

    this.validator.addRule('color', {
      validator: (value: string) => is.string(value),
      message: 'Cor inválida. Informe uma cor válida'
    })
  }
}
