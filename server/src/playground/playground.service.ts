import axios, { AxiosRequestConfig } from 'axios';

export class PlaygroundService {
  async makeRequest(data: {
    method: string;
    url: string;
    host?: string;
    headers?: Record<string, string>;
    params?: Record<string, string>;
    body?: Record<string, any>;
  }) {
    const config: AxiosRequestConfig = {
      method: data.method as any,
      url: data.url,
      baseURL: data.host,
      headers: data.headers,
      params: data.params,
      data: data.body,
    };

    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}
