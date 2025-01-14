import { createContext, useEffect, useState } from 'react';
import { AuthContextType } from './Types';
import { MilvusService } from '@/http';
import {
  MILVUS_CLIENT_ID,
  MILVUS_URL,
  MILVUS_DATABASE,
  ATTU_AUTH_REQ,
} from '@/consts';
import type { AuthReq } from '@server/types';

export const authContext = createContext<AuthContextType>({
  clientId: '',
  authReq: {
    username: '',
    password: '',
    address: '',
    token: '',
    database: '',
    checkHealth: true,
    clientId: '',
  },
  setAuthReq: () => {},
  isManaged: false,
  isAuth: false,
  login: async () => {
    return { clientId: '', database: '' };
  },
  logout: () => {},
});

const { Provider } = authContext;
export const AuthProvider = (props: { children: React.ReactNode }) => {
  // get data from local storage
  const localClientId = window.localStorage.getItem(MILVUS_CLIENT_ID) || '';
  const localAuthReq = JSON.parse(
    window.localStorage.getItem(ATTU_AUTH_REQ) ||
      JSON.stringify({
        username: '',
        password: '',
        address: MILVUS_URL,
        token: '',
        database: MILVUS_DATABASE,
        checkHealth: true,
        clientId: localClientId,
      })
  );

  // state
  const [authReq, setAuthReq] = useState<AuthReq>(localAuthReq);
  const [clientId, setClientId] = useState<string>(localClientId);

  // update local storage when authReq changes
  useEffect(() => {
    // store auth request in local storage
    window.localStorage.setItem(
      ATTU_AUTH_REQ,
      JSON.stringify({ ...authReq, password: '', token: '' })
    );
    // set title
    document.title = authReq.address ? `${authReq.address} - Attu` : 'Attu';
  }, [authReq]);

  // login API
  const login = async (params: AuthReq) => {
    // create a new client id
    params.clientId = Math.random().toString(36).substring(7);
    // save clientId to local storage
    // console.log('params.clientId', params.clientId);
    window.localStorage.setItem(MILVUS_CLIENT_ID, params.clientId);
    // connect to Milvus
    const res = await MilvusService.connect(params);
    // update auth request
    setAuthReq({ ...params, database: res.database });
    setClientId(res.clientId);

    // save clientId to local storage
    window.localStorage.setItem(MILVUS_CLIENT_ID, res.clientId);

    return res;
  };
  // logout API
  const logout = async (pass?: boolean) => {
    if (!pass) {
      // close connetion
      await MilvusService.closeConnection();
    }
    // clear client id
    setClientId('');
    // remove client id from local storage
    window.localStorage.removeItem(MILVUS_CLIENT_ID);
  };

  return (
    <Provider
      value={{
        authReq,
        setAuthReq,
        login,
        logout,
        clientId,
        isAuth: !!clientId,
        isManaged: authReq.address.includes('zilliz'),
      }}
    >
      {props.children}
    </Provider>
  );
};
