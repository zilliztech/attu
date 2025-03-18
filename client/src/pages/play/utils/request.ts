import axios from 'axios';

type PlaygroundRequestOptions = {
  url: string;
  method?: string;
  host?: string;
  headers?: Record<string, string | undefined>;
  params?: Record<string, string>;
  body?: Record<string, any>;
};

function isLocalhost(url: string): boolean {
  const regex =
    /^(http:\/\/|https:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?(\/.*)?$/;
  return regex.test(url);
}

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
    if (isLocalhost(host) || type === 'frontend') {
      return axios.request({
        url,
        method,
        headers,
        baseURL: host,
        data: body,
        params,
      });
    }
    return axios.post('/api/v1/playground', {
      host,
      url,
      headers,
      method,
      body,
      params,
    });
  };
