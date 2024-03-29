import http from './Axios';
import { Method } from 'axios';

type findParamsType = {
  method?: Method;
  path: string;
  params: { [x: string]: any };
  timeout?: number;
};

type updateParamsType = {
  path: string;
  data?: any;
};

export default class BaseModel {
  static async findAll<T>(data: findParamsType) {
    const { params = {}, path = '', method = 'get' } = data;
    const type = method === 'post' ? 'data' : 'params';
    const httpConfig = {
      method,
      url: path,
      [type]: { ...params },
    };

    const res = await http(httpConfig);
    let list = res.data.data || [];
    if (!Array.isArray(list)) {
      return list as T;
    }

    return Object.assign(list, {
      _total: res.data.data.total_count || list.length,
    } as T);
  }

  static async search<T>(data: findParamsType) {
    const { method = 'get', params = {}, path = '', timeout } = data;
    const httpConfig = {
      method,
      url: path,
      params,
    } as any;
    if (timeout) httpConfig.timeout = timeout;
    const res = await http(httpConfig);
    return (res.data.data || {}) as T;
  }

  /**
   * Create instance in database
   */
  static async create<T>(options: updateParamsType) {
    const { path, data } = options;
    const res = await http.post(path, data);
    return (res.data.data || {}) as T;
  }

  static async update<T>(options: updateParamsType) {
    const { path, data } = options;
    const res = await http.put(path, data);

    return (res.data.data || {}) as T;
  }

  static async delete<T>(options: updateParamsType) {
    const { path, data } = options;

    const res = await http.delete(path, { data: data });

    return res.data as T;
  }

  static async batchDelete<T>(options: updateParamsType) {
    const { path, data } = options;
    const res = await http.post(path, data);
    return res.data as T;
  }

  static async query(options: updateParamsType) {
    const { path, data } = options;
    const res = await http.post(path, data);
    return res.data.data;
  }
}
