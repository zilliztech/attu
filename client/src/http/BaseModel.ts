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
  constructor(props: any) {
    return this;
  }

  static async findAll(data: findParamsType) {
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
      return list;
    }

    return Object.assign(
      list.map(v => new this(v)),
      {
        _total: res.data.data.total_count || list.length,
      }
    );
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
    return new this(res.data.data || {}) as T;
  }

  /**
   * Create instance in database
   */
  static async create<T>(options: updateParamsType) {
    const { path, data } = options;
    const res = await http.post(path, data);
    return new this(res.data.data || {}) as T;
  }

  static async update<T>(options: updateParamsType) {
    const { path, data } = options;
    const res = await http.put(path, data);

    return new this(res.data.data || {}) as T;
  }

  static async delete<T>(options: updateParamsType) {
    const { path, data } = options;

    const res = await http.delete(path, { data: data });

    return res.data;
  }

  static async batchDelete(options: updateParamsType) {
    const { path, data } = options;
    const res = await http.post(path, data);
    return res.data;
  }

  static async query(options: updateParamsType) {
    const { path, data } = options;
    const res = await http.post(path, data);
    return res.data.data;
  }
}
