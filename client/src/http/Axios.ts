import axios from 'axios';
import { SESSION } from '../consts/Localstorage';

console.log(process.env.NODE_ENV, 'api:', process.env.REACT_APP_BASE_URL);
console.log('docker env', (window as any)._env_, (window as any)._env_);

export const url =
  ((window as any)._env_ &&
    (window as any)._env_.API_URL !== null &&
    (window as any)._env_.API_URL !== 'null' &&
    (window as any)._env_.API_URL) ||
  process.env.REACT_APP_BASE_URL;

const axiosInstance = axios.create({
  baseURL: `${url}/api/v1`,
  timeout: 10000,
});

axiosInstance.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    const session = window.localStorage.getItem(SESSION);

    // console.log('in----', token);
    session && (config.headers[SESSION] = session);

    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

export default axiosInstance;
