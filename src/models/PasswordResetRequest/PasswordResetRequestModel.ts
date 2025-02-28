import { Types } from 'mongoose'

import { IListModelsFilters, IModel, IUpdateModelProps, ModelAction } from '../../core/interfaces/Model'
import Model from '../../core/Model'
import { DateUtils } from '../../utils/Date'
import { generate } from '../../utils/generate'

export interface IListPasswordResetRequestsFilters extends IListModelsFilters { }

export interface IUpdatePasswordResetRequestProps extends IUpdateModelProps<IPasswordResetRequest> { }

export enum PasswordResetRequestStatus {
  pending = 'pending',
  failed = 'failed',
  expired = 'expired',
  reseted = 'reseted'
}

export const PasswordResetRequestStatusValues = Object.values(PasswordResetRequestStatus)

export interface IPasswordResetRequestsStatusDates extends Partial<Record<PasswordResetRequestStatus, Date>> { }

export interface IFindPasswordResetRequestByUserIdProps {
  userId: Types.ObjectId
  tenantId: Types.ObjectId
}

export interface IFindPasswordResetRequestByTokenProps {
  token: string
  tenantId: Types.ObjectId
}

export interface IPasswordResetRequest extends IModel {
  token?: string
  status?: PasswordResetRequestStatus
  statusDates?: IPasswordResetRequestsStatusDates
  expirationDate?: Date

  userId: Types.ObjectId
  email: string
}

export class PasswordResetRequestModel extends Model<IPasswordResetRequest> {
  private _token?: IPasswordResetRequest['token']
  private _status?: IPasswordResetRequest['status']
  private _statusDates?: IPasswordResetRequest['statusDates']
  private _expirationDate?: IPasswordResetRequest['expirationDate']

  private _userId: IPasswordResetRequest['userId']
  private _email: IPasswordResetRequest['email']

  constructor (passwordResetRequest: IPasswordResetRequest) {
    super(passwordResetRequest)

    this._token = passwordResetRequest.token ?? generate.passwordToken()
    this._status = passwordResetRequest.status ?? PasswordResetRequestStatus.pending
    this._userId = passwordResetRequest.userId
    this._email = passwordResetRequest.email
    this._expirationDate = passwordResetRequest.expirationDate || generate.tokenExpirationDate()
    this._statusDates = {
      [this._status!]: DateUtils.getCurrent()
    }
    this.actions = passwordResetRequest.actions || [{
      action: ModelAction.create,
      date: DateUtils.getCurrent(),
      userId: this._userId
    }]
  }

  get token (): IPasswordResetRequest['token'] {
    return this._token
  }

  get userId (): IPasswordResetRequest['userId'] {
    return this._userId
  }

  get status (): IPasswordResetRequest['status'] {
    return this._status
  }

  get object (): IPasswordResetRequest {
    return {
      _id: this._id,
      actions: this.actions,
      active: this.active,
      createdAt: this.createdAt,
      deletionDate: this.deletionDate,
      tenantId: this.tenantId,
      token: this._token,
      status: this._status,
      userId: this._userId,
      email: this._email,
      statusDates: this._statusDates,
      expirationDate: this._expirationDate
    }
  }

  get show () {
    return this.object
  }
}
