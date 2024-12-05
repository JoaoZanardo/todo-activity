import { Response } from 'express'

import CustomResponse from '../utils/CustomResponse'

export const customResponseMiddleware = (response: Response) => {
  response.OK = (message: string, data: any) => {
    response.status(200).json(CustomResponse.OK(message, data))
  }

  response.CREATED = (message: string, data: any) => {
    response.status(201).json(CustomResponse.CREATED(message, data))
  }

  response.ACCEPTED = (message: string, data: any) => {
    response.status(202).json(CustomResponse.ACCEPTED(message, data))
  }

  response.NO_CONTENT = (message: string, data: any) => {
    response.status(204).json(CustomResponse.NO_CONTENT(message, data))
  }

  response.BAD_REQUEST = (message: string, data: any) => {
    response.status(400).json(CustomResponse.BAD_REQUEST(message, data))
  }

  response.UNAUTHORIZED = (message: string, data: any) => {
    response.status(401).json(CustomResponse.UNAUTHORIZED(message, data))
  }

  response.FORBIDDEN = (message: string, data: any) => {
    response.status(403).json(CustomResponse.FORBIDDEN(message, data))
  }

  response.NOT_FOUND = (message: string, data: any) => {
    response.status(404).json(CustomResponse.NOT_FOUND(message, data))
  }

  response.NOT_ACCEPTABLE = (message: string, data: any) => {
    response.status(406).json(CustomResponse.NOT_ACCEPTABLE(message, data))
  }

  response.REQUEST_TIMEOUT = (message: string, data: any) => {
    response.status(408).json(CustomResponse.REQUEST_TIMEOUT(message, data))
  }

  response.CONFLICT = (message: string, data: any) => {
    response.status(409).json(CustomResponse.CONFLICT(message, data))
  }

  response.UNPROCESSABLE_ENTITY = (message: string, data: any) => {
    response.status(422).json(CustomResponse.CONFLICT(message, data))
  }

  response.TOO_MANY_REQUESTS = (message: string, data: any) => {
    response.status(429).json(CustomResponse.TOO_MANY_REQUESTS(message, data))
  }

  response.UNAVAILABLE_FOR_LEGAL_REASONS = (message: string, data: any) => {
    response.status(451).json(CustomResponse.UNAVAILABLE_FOR_LEGAL_REASONS(message, data))
  }

  response.INTERNAL_SERVER_ERROR = (message: string, data: any) => {
    response.status(500).json(CustomResponse.INTERNAL_SERVER_ERROR(message, data))
  }

  response.NOT_IMPLEMENTED = (message: string, data: any) => {
    response.status(501).json(CustomResponse.NOT_IMPLEMENTED(message, data))
  }

  response.BAD_GATEWAY = (message: string, data: any) => {
    response.status(502).json(CustomResponse.BAD_GATEWAY(message, data))
  }

  response.SERVICE_UNAVAILABLE = (message: string, data: any) => {
    response.status(503).json(CustomResponse.SERVICE_UNAVAILABLE(message, data))
  }

  response.GATEWAY_TIMEOUT = (message: string, data: any) => {
    response.status(504).json(CustomResponse.GATEWAY_TIMEOUT(message, data))
  }
}
