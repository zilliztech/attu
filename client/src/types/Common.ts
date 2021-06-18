export interface KeyValuePair {
  label: string;
  value: string | number;
}

export interface IRes {
  code: number;
  message: string;
  data?: any;
}

export interface IPagination {
  offset?: number;
  limit?: number;
}

export interface IPaginationRes {
  count: number;
  limit: number;
  offset: number;
  total_count: number;
}

export enum ManageRequestMethods {
  DELETE = 'delete',
  CREATE = 'create',
}
