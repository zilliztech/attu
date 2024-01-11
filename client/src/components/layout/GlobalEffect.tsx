import React, { useContext } from 'react';
import axiosInstance from '@/http/Axios';
import { rootContext, authContext } from '@/context';
import { HTTP_STATUS_CODE } from '@server/utils/Const';

let axiosResInterceptor: number | null = null;
// let timer: Record<string, ReturnType<typeof setTimeout> | number>[] = [];
// we only take side effect here, nothing else
const GlobalEffect = (props: { children: React.ReactNode }) => {
  const { openSnackBar } = useContext(rootContext);
  const { logout } = useContext(authContext);

  // catch axios error here
  if (axiosResInterceptor === null) {
    axiosResInterceptor = axiosInstance.interceptors.response.use(
      function (res: any) {
        if (res.statusCode && res.statusCode !== HTTP_STATUS_CODE.OK) {
          openSnackBar(res.data.message, 'warning');
          return Promise.reject(res.data);
        }

        return res;
      },
      function (error: any) {
        const { response = {} } = error;

        switch (response.status) {
          case HTTP_STATUS_CODE.UNAUTHORIZED:
          case HTTP_STATUS_CODE.FORBIDDEN:
            setTimeout(logout, 1000);
            break;
          default:
            break;
        }
        if (response.data) {
          const { message: errMsg } = response.data;
          // We need check status 401 in login page
          // So server will return 500 when change the user password.
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
