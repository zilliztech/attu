import axios from 'axios';
import { MILVUS_ADDRESS } from '../consts/Localstorage';
// import { SESSION } from '../consts/Localstorage';

// console.log(process.env.NODE_ENV, 'api:', process.env.REACT_APP_BASE_URL);
// console.log('docker env', (window as any)._env_);
const isElectron =
  (window as any)._env_ && (window as any)._env_.IS_ELECTRON === 'yes';
export const url =
  process.env.NODE_ENV === 'development' || isElectron
    ? (window as any)._env_ && (window as any)._env_.HOST_URL
    : '';

const axiosInstance = axios.create({
  baseURL: `${url}/api/v1`,
  timeout: 60000,
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
