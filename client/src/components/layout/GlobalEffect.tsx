import React, { useContext, useEffect } from 'react';
import axiosInstance from '@/http/Axios';
import { rootContext, authContext, dataContext } from '@/context';
import { HTTP_STATUS_CODE } from '@server/utils/Const';

let axiosResInterceptor: number | null = null;

const GlobalEffect = ({ children }: { children: React.ReactNode }) => {
  const { openSnackBar } = useContext(rootContext);
  const { logout } = useContext(authContext);
  const { database } = useContext(dataContext);

  useEffect(() => {
    // Add database header to all axios requests
    const requestInterceptor = axiosInstance.interceptors.request.use(
      config => {
        config.headers['x-attu-database'] = database;
        return config;
      },
      error => Promise.reject(error)
    );

    // Clean up interceptor on unmount
    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
    };
  }, [database]);

  useEffect(() => {
    if (axiosResInterceptor === null) {
      axiosResInterceptor = axiosInstance.interceptors.response.use(
        (response: any) => {
          if (
            response.statusCode &&
            response.statusCode !== HTTP_STATUS_CODE.OK
          ) {
            openSnackBar(response.data.message, 'warning');
            return Promise.reject(response.data);
          }
          return response;
        },
        error => {
          const { response } = error;
          let messageType = 'error';

          if (response) {
            switch (response.status) {
              case HTTP_STATUS_CODE.UNAUTHORIZED:
                setTimeout(() => logout(true), 1000);
                break;

              case HTTP_STATUS_CODE.FORBIDDEN:
                messageType = 'warning';
                break;
              default:
                break;
            }
            const errorMessage = response.data?.message;
            if (errorMessage) {
              openSnackBar(errorMessage, messageType);
              return Promise.reject(error);
            }
          }
          // Handle other error cases
          openSnackBar(error.message, messageType);
          return Promise.reject(error);
        }
      );
    }

    // Clean up response interceptor on unmount
    return () => {
      if (axiosResInterceptor !== null) {
        axiosInstance.interceptors.response.eject(axiosResInterceptor);
        axiosResInterceptor = null;
      }
    };
  }, [logout, openSnackBar]);

  return <>{children}</>;
};

export default GlobalEffect;
