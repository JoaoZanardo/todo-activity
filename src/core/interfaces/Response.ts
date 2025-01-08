import { AxiosResponse } from 'axios'

interface IResponseData<T = any> {
    data?: T
    message: string
    code: number
    status: string
  }

  interface IResponse<T = any> extends AxiosResponse<IResponseData<T>> {}

export type {
  IResponse,
  IResponseData
}
