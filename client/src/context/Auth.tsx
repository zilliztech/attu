import { createContext, useEffect, useState } from 'react';
import { AuthContextType } from './Types';
import { MilvusService } from '@/http';
import { AuthReq } from '@server/types';
import { MILVUS_CLIENT_ID, MILVUS_URL, MILVUS_DATABASE } from '@/consts';

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
    return { clientId: '' };
  },
  logout: () => {},
});

const { Provider } = authContext;
export const AuthProvider = (props: { children: React.ReactNode }) => {
  const [authReq, setAuthReq] = useState<AuthReq>({
    username: '',
    password: '',
    address: '' || MILVUS_URL,
    token: '',
    database: '' || MILVUS_DATABASE,
  });

  const [clientId, setClientId] = useState<string>('');

  useEffect(() => {
    document.title = authReq.address ? `${authReq.address} - Attu` : 'Attu';
    return () => {
      document.title = 'Attu';
    };
  }, [authReq.address]);

  const login = async (params: AuthReq) => {
    setAuthReq(params);
    const res = await MilvusService.connect(params);
    setClientId(res.clientId);

    return res;
  };
  const logout = () => {
    // update state
    setAuthReq({
      ...authReq,
      username: '',
      password: '',
      token: '',
    });
    setClientId('');
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
