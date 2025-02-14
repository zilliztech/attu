import { type AxiosError, type AxiosResponse } from "axios"

export enum CustomEventNameEnum {
  PlaygroundResponseDetail = 'playgroundResponseDetail'
}

export interface PlaygroundCustomEventDetail {
  loading?: boolean
  response?: AxiosResponse['data']
  error?: object
}

export interface PlaygroundExtensionParams {
  baseUrl: string
  token?: string
  username?: string
  password?: string
}
