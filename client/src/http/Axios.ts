import axios from 'axios';
import { MILVUS_CLIENT_ID } from '@/consts';

// base hots url
const DEFAULT_HOST_URL = `http://127.0.0.1:3000`;

const hostUrl: { [key: string]: string | undefined } = {
  development: DEFAULT_HOST_URL,
  production: ((window as any)._env_ && (window as any)._env_.HOST_URL) || '',
  electron: DEFAULT_HOST_URL,
};

const isElectron =
  (window as any)._env_ && (window as any)._env_.IS_ELECTRON === 'yes';

export const url = hostUrl[isElectron ? 'electron' : import.meta.env.MODE];

const axiosInstance = axios.create({
  baseURL: `${url}/api/v1`,
  timeout: 60000 * 5, // 5 minutes
});

axiosInstance.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    const address = window.localStorage.getItem(MILVUS_CLIENT_ID);

    address && (config.headers[MILVUS_CLIENT_ID] = address);

    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

export default axiosInstance;
