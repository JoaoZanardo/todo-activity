import { Types } from 'mongoose'

import { IUser } from '../../models/User/UserModel'

declare global {
  namespace Express {
    interface Request {
      userId: Types.ObjectId
      user: IUser
      tenantId: Types.ObjectId
      filePath?: string
    }

    interface Response {
      OK: (message: string, data?: any) => void
      CREATED: (message: string, data?: any) => void
      ACCEPTED: (message: string, data?: any) => void
      NO_CONTENT: (message: string, data?: any) => void
      BAD_REQUEST: (message: string, data?: any) => void
      UNAUTHORIZED: (message: string, data?: any) => void
      FORBIDDEN: (message: string, data?: any) => void
      NOT_FOUND: (message: string, data?: any) => void
      NOT_ACCEPTABLE: (message: string, data?: any) => void
      REQUEST_TIMEOUT: (message: string, data?: any) => void
      CONFLICT: (message: string, data?: any) => void
      UNPROCESSABLE_ENTITY: (message: string, data?: any) => void
      TOO_MANY_REQUESTS: (message: string, data?: any) => void
      UNAVAILABLE_FOR_LEGAL_REASONS: (message: string, data?: any) => void
      INTERNAL_SERVER_ERROR: (message: string, data?: any) => void
      NOT_IMPLEMENTED: (message: string, data?: any) => void
      BAD_GATEWAY: (message: string, data?: any) => void
      SERVICE_UNAVAILABLE: (message: string, data?: any) => void
      GATEWAY_TIMEOUT: (message: string, data?: any) => void
    }
  }
}
