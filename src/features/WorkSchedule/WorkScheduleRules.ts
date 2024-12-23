/* eslint-disable no-useless-constructor */
import Rules from '../../core/Rules'
import { Day, DayValues } from '../../models/WorkSchedule/WorkScheduleModel'
import is from '../../utils/is'

export class WorkScheduleRules extends Rules {
  constructor () {
    super()

    this.validator.addRule('days', {
      validator: (value: Day) => DayValues.includes(value),
      message: 'Dia inválido. Informe um dia válido!'
    })

    this.validator.addRule('hour', {
      validator: (value: string) => is.string(value),
      message: 'Hora inválida. Informe uma hora válida!'
    })

    this.validator.addRule('name', {
      validator: (value: string) => is.string(value),
      message: 'Nome inválido. Informe um nome válido!'
    })

    this.validator.addRule('description', {
      validator: (value: string) => is.string(value),
      message: 'Descrição inválida. Informe uma descrição válida!'
    })
  }
}
