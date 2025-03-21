import axios from 'axios';

type PlaygroundRequestOptions = {
  url: string;
  method?: string;
  host?: string;
  headers?: Record<string, string | undefined>;
  params?: Record<string, string>;
  body?: Record<string, any>;
};

export const playgroundRequest = (options: PlaygroundRequestOptions) => {
  const {
    url,
    method = 'POST',
    host = '',
    headers = {},
    body = {},
    params = {},
  } = options;

  return axios.post('/api/v1/playground', {
    host,
    url,
    headers,
    method,
    body,
    params,
  });
};
