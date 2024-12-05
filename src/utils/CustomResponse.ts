import {
  ReasonPhrases,
  StatusCodes
} from 'http-status-codes'

export default class CustomResponse {
  constructor (
      private code: number,
      private status: string,
      private message: string,
      private data?: any
  ) {
    this.code = code
    this.status = status
    this.message = message
    this.data = data
  }

  static OK (message: string, data?: any): CustomResponse {
    return new CustomResponse(StatusCodes.OK, ReasonPhrases.OK, message, data)
  }

  static CREATED (message: string, data?: any): CustomResponse {
    return new CustomResponse(StatusCodes.CREATED, ReasonPhrases.CREATED, message, data)
  }

  static ACCEPTED (message: string, data?: any): CustomResponse {
    return new CustomResponse(StatusCodes.ACCEPTED, ReasonPhrases.ACCEPTED, message, data)
  }

  static NO_CONTENT (message: string, data?: any): CustomResponse {
    return new CustomResponse(StatusCodes.NO_CONTENT, ReasonPhrases.NO_CONTENT, message, data)
  }

  static BAD_REQUEST (message: string, data?: any): CustomResponse {
    return new CustomResponse(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST, message, data)
  }

  static UNAUTHORIZED (message: string, data?: any): CustomResponse {
    return new CustomResponse(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED, message, data)
  }

  static FORBIDDEN (message: string, data?: any): CustomResponse {
    return new CustomResponse(StatusCodes.FORBIDDEN, ReasonPhrases.FORBIDDEN, message, data)
  }

  static NOT_FOUND (message: string, data?: any): CustomResponse {
    return new CustomResponse(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND, message, data)
  }

  static NOT_ACCEPTABLE (message: string, data?: any): CustomResponse {
    return new CustomResponse(StatusCodes.NOT_ACCEPTABLE, ReasonPhrases.NOT_ACCEPTABLE, message, data)
  }

  static REQUEST_TIMEOUT (message: string, data?: any): CustomResponse {
    return new CustomResponse(StatusCodes.REQUEST_TIMEOUT, ReasonPhrases.REQUEST_TIMEOUT, message, data)
  }

  static CONFLICT (message: string, data?: any): CustomResponse {
    return new CustomResponse(StatusCodes.CONFLICT, ReasonPhrases.CONFLICT, message, data)
  }

  static UNPROCESSABLE_ENTITY (message: string, data?: any): CustomResponse {
    return new CustomResponse(StatusCodes.UNPROCESSABLE_ENTITY, ReasonPhrases.UNPROCESSABLE_ENTITY, message, data)
  }

  static TOO_MANY_REQUESTS (message: string, data?: any): CustomResponse {
    return new CustomResponse(StatusCodes.TOO_MANY_REQUESTS, ReasonPhrases.TOO_MANY_REQUESTS, message, data)
  }

  static UNAVAILABLE_FOR_LEGAL_REASONS (message: string, data?: any): CustomResponse {
    return new CustomResponse(StatusCodes.UNAVAILABLE_FOR_LEGAL_REASONS, ReasonPhrases.UNAVAILABLE_FOR_LEGAL_REASONS, message, data)
  }

  static INTERNAL_SERVER_ERROR (message: string, data?: any): CustomResponse {
    return new CustomResponse(StatusCodes.INTERNAL_SERVER_ERROR, ReasonPhrases.INTERNAL_SERVER_ERROR, message, data)
  }

  static NOT_IMPLEMENTED (message: string, data?: any): CustomResponse {
    return new CustomResponse(StatusCodes.NOT_IMPLEMENTED, ReasonPhrases.NOT_IMPLEMENTED, message, data)
  }

  static BAD_GATEWAY (message: string, data?: any): CustomResponse {
    return new CustomResponse(StatusCodes.BAD_GATEWAY, ReasonPhrases.BAD_GATEWAY, message, data)
  }

  static SERVICE_UNAVAILABLE (message: string, data?: any): CustomResponse {
    return new CustomResponse(StatusCodes.SERVICE_UNAVAILABLE, ReasonPhrases.SERVICE_UNAVAILABLE, message, data)
  }

  static GATEWAY_TIMEOUT (message: string, data?: any): CustomResponse {
    return new CustomResponse(StatusCodes.GATEWAY_TIMEOUT, ReasonPhrases.GATEWAY_TIMEOUT, message, data)
  }
}
