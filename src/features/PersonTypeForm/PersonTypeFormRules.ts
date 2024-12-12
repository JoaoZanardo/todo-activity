/* eslint-disable no-useless-constructor */
import Rules from '../../core/Rules'
import is from '../../utils/is'

export class PersonTypeFormRules extends Rules {
  constructor () {
    super()

    this.validator.addRule('personTypeFormId', {
      validator: (value: string) => is.objectId(value),
      message: 'Identificador de formulário tipo de pessoa inválido. Informe um identificador válido!'
    })
  }
}
