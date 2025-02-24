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
  isManaged: boolean
  token?: string
  username?: string
  password?: string
}

export type IdentifierMap = {
  name: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
  children?: IdentifierMap[];
};

export type CompletionMacro = {
  label: string;
  apply: string;
  type: 'text';
  detail: 'macro';
}
