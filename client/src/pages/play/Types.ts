import { type AxiosError, type AxiosResponse } from "axios"

export interface PlaygroundCustomEventDetail {
  loading: boolean
  response: AxiosResponse['data']
  error: AxiosError
}
