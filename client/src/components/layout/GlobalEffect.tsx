import React, { useContext } from 'react';
import axiosInstance from '../../http/Axios';
import { rootContext } from '../../context/Root';
import { CODE_STATUS } from '../../consts/Http';
import { authContext } from '../../context/Auth';
import { MILVUS_ADDRESS } from '../../consts/Localstorage';

let axiosResInterceptor: number | null = null;
// let timer: Record<string, ReturnType<typeof setTimeout> | number>[] = [];
// we only take side effect here, nothing else
const GlobalEffect = (props: { children: React.ReactNode }) => {
  const { openSnackBar } = useContext(rootContext);
  const { setIsAuth, setAddress } = useContext(authContext);

  // catch axios error here
  if (axiosResInterceptor === null) {
    axiosResInterceptor = axiosInstance.interceptors.response.use(
      function (res: any) {
        if (res.statusCode && res.statusCode !== CODE_STATUS.SUCCESS) {
          openSnackBar(res.data.message, 'warning');
          return Promise.reject(res.data);
        }

        return res;
      },
      function (error: any) {
        const { response = {} } = error;
        const reset = () => {
          setIsAuth(false);
          setAddress('');
          window.localStorage.removeItem(MILVUS_ADDRESS);
        };
        switch (response.status) {
          case CODE_STATUS.UNAUTHORIZED:
            return Promise.reject(error);
          case CODE_STATUS.FORBIDDEN:
            reset();
            break;
          default:
            break;
        }
        if (response.data) {
          const { message: errMsg } = response.data;
          // After create index ,we will try to get index progress
          // if index created success before setTimeout , will throw this error, should ignore it.
          if (errMsg.includes('no index is created')) {
            return Promise.reject(error);
          }
          // We need check status 401 in login page
          // So server will return 500 when change the user password.
          errMsg && openSnackBar(errMsg, 'error');
          if (errMsg.includes('unauthenticated')) {
            reset();
          }
          return Promise.reject(error);
        }
        if (error.message) {
          openSnackBar(error.message, 'error');
        }
        return Promise.reject(error);
      }
    );
  }
  // get global data

  return <>{props.children}</>;
};

export default GlobalEffect;
