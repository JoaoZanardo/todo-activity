import requestCheck from 'request-check'

import CustomResponse from '../utils/CustomResponse'
import is from '../utils/is'
import ObjectId from '../utils/ObjectId'

export default class Rules {
  public validator

  constructor () {
    this.validator = requestCheck()

    this.validator.requiredMessage = 'Campo obrigatório!'

    this.validator.addRule('active', {
      validator: (value: string) => is.boolean(value),
      message: 'Ativo inválido. Informe um ativo válido!'
    })

    this.validator.addRule('accessGroupId', {
      validator: (value: string) => ObjectId(value),
      message: 'Identificador de grupo de acesso inválido. Informe um identificador válido!'
    })

    this.validator.addRule('personTypeId', {
      validator: (value: string) => is.objectId(value),
      message: 'Identificador de tipo de pessoa inválido. Informe um identificador válido!'
    })

    this.validator.addRule('personId', {
      validator: (value: string) => is.objectId(value),
      message: 'Identificador de pessoa inválido. Informe um identificador válido!'
    })

    this.validator.addRule('equipmentId', {
      validator: (value: string) => is.objectId(value),
      message: 'Identificador de equipamento inválido. Informe um identificador válido!'
    })

    this.validator.addRule('areaId', {
      validator: (value: string) => is.objectId(value),
      message: 'Identificador de área inválido. Informe um identificador válido!'
    })

    this.validator.addRule('accessAreaId', {
      validator: (value: string) => is.objectId(value),
      message: 'Identificador de área de acesso inválido. Informe um identificador válido!'
    })

    this.validator.addRule('accessPointId', {
      validator: (value: string) => is.objectId(value),
      message: 'Identificador de ponto de acesso inválido. Informe um identificador válido!'
    })

    this.validator.addRule('accessReleaseId', {
      validator: (value: string) => is.objectId(value),
      message: 'Identificador de liberação de acesso inválido. Informe um identificador válido!'
    })

    this.validator.addRule('accessSynchronization', {
      validator: (value: string) => is.objectId(value),
      message: 'Identificador de sincronização de acesso inválido. Informe um identificador válido!'
    })

    this.validator.addRule('noticeId', {
      validator: (value: string) => is.objectId(value),
      message: 'Identificador de aviso inválido. Informe um identificador válido!'
    })

    this.validator.addRule('accessReleaseInvitationId', {
      validator: (value: string) => is.objectId(value),
      message: 'Identificador de convite inválido. Informe um identificador válido!'
    })

    this.validator.addRule('accessReleaseInvitationGroupId', {
      validator: (value: string) => is.objectId(value),
      message: 'Identificador de grupo de convite inválido. Informe um identificador válido!'
    })

    this.validator.addRule('guestId', {
      validator: (value: string) => is.objectId(value),
      message: 'Identificador do convidado inválido. Informe um identificador válido!'
    })
  }

  public invalid (...args: Array<{ [key: string]: any, isRequiredField?: boolean } | null | undefined>): any {
    return this.validator.check(...args as any)
  }

  public validate (...args: Array<{ [key: string]: any, isRequiredField?: boolean } | null>): any {
    const invalid = this.validator.check(...args as any)
    if (invalid) throw CustomResponse.UNPROCESSABLE_ENTITY(`Campos inválidos (${invalid.length})`, invalid)
  }
}
