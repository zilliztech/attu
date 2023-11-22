import axios from 'axios';
import { MILVUS_ADDRESS } from '@/consts';

export const url =
  ((window as any)._env_ && (window as any)._env_.HOST_URL) || '';

const axiosInstance = axios.create({
  baseURL: `${url}/api/v1`,
  timeout: 60000 * 5, // 5 minutes
});

axiosInstance.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    const address = window.localStorage.getItem(MILVUS_ADDRESS);

    address && (config.headers[MILVUS_ADDRESS] = address);

    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

export default axiosInstance;
