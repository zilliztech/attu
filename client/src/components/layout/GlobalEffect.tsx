import React, { useContext } from 'react';
import axiosInstance from '../../http/Axios';
import { rootContext } from '../../context/Root';
import { CODE_STATUS } from '../../consts/Http';

let axiosResInterceptor: number | null = null;
// let timer: Record<string, ReturnType<typeof setTimeout> | number>[] = [];
// we only take side effect here, nothing else
const GlobalEffect = (props: { children: React.ReactNode }) => {
  const { openSnackBar } = useContext(rootContext);

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

        if (response.data) {
          const { message: errMsg } = response.data;

          errMsg && openSnackBar(errMsg, 'error');
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
