import axios from 'axios';

type PlaygroundRequestOptions = {
  url: string;
  method?: string;
  host?: string;
  headers?: Record<string, string | undefined>;
  params?: Record<string, string>;
  body?: Record<string, any>;
};

export const createPlaygroundRequest =
  (type: 'frontend' | 'backend') => (options: PlaygroundRequestOptions) => {
    const {
      url,
      method = 'POST',
      host = '',
      headers = {},
      body = {},
      params = {},
    } = options;
    if (type === 'backend') {
      return axios.post('/api/v1/playground', {
        host,
        url,
        headers,
        method,
        body,
        params,
      });
    }
    return axios.request({
      url,
      method,
      headers,
      baseURL: host,
      data: body,
      params,
    });
  };
