/* eslint-disable no-useless-constructor */
import Rules from '../../core/Rules'
import is from '../../utils/is'

export class TenantRules extends Rules {
  constructor () {
    super()

    this.validator.addRule('tenantId', {
      validator: (value: string) => is.objectId(value),
      message: 'Código de licença inválido!'
    })

    this.validator.addRule('color', {
      validator: (value: string) => is.string(value),
      message: 'Cor inválida. Informe uma cor válida!'
    })

    this.validator.addRule('image', {
      validator: (value: string) => is.string(value),
      message: 'Imagem inválida. Informe uma imagem inválida!'
    })
  }
}
