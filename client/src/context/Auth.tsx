import { createContext, useEffect, useState } from 'react';
import { AuthContextType } from './Types';
import { MilvusService } from '@/http';
import { AuthReq } from '@server/types';
import {
  MILVUS_CLIENT_ID,
  MILVUS_URL,
  MILVUS_DATABASE,
  ATTU_AUTH_REQ,
} from '@/consts';

export const authContext = createContext<AuthContextType>({
  clientId: '',
  authReq: {
    username: '',
    password: '',
    address: '',
    token: '',
    database: '',
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
  const localAuthReq = JSON.parse(
    window.localStorage.getItem(ATTU_AUTH_REQ) ||
      JSON.stringify({
        username: '',
        password: '',
        address: MILVUS_URL,
        token: '',
        database: MILVUS_DATABASE,
      })
  );

  // state
  const [authReq, setAuthReq] = useState<AuthReq>(localAuthReq);
  const [clientId, setClientId] = useState<string>(
    window.localStorage.getItem(MILVUS_CLIENT_ID) || ''
  );

  // update local storage when authReq changes
  useEffect(() => {
    // store auth request in local storage
    window.localStorage.setItem(
      ATTU_AUTH_REQ,
      JSON.stringify({ ...authReq, password: '', token: '' })
    );
  }, [authReq]);

  // login API
  const login = async (params: AuthReq) => {
    // connect to Milvus
    const res = await MilvusService.connect(params);
    // update auth request
    setAuthReq({ ...params, database: res.database });
    setClientId(res.clientId);

    return res;
  };
  // logout API
  const logout = () => {
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
