import { createContext, useEffect, useMemo, useState } from 'react';
import { MILVUS_ADDRESS } from '../consts/Localstorage';
import { MilvusHttp } from '../http/Milvus';
import { AuthContextType } from './Types';

export const authContext = createContext<AuthContextType>({
  isAuth: false,
  address: '',
  setAddress: () => {},
});

const { Provider } = authContext;
export const AuthProvider = (props: { children: React.ReactNode }) => {
  const [address, setAddress] = useState<string>(
    window.localStorage.getItem(MILVUS_ADDRESS) || ''
  );
  const isAuth = useMemo(() => !!address, [address]);

  useEffect(() => {
    const check = async () => {
      const milvusAddress = window.localStorage.getItem(MILVUS_ADDRESS) || '';
      try {
        const res = await MilvusHttp.check(milvusAddress);
        setAddress(res.data.connected ? milvusAddress : '');
        if (!res.data.connected) {
          window.localStorage.removeItem(MILVUS_ADDRESS);
        }
      } catch (error) {
        setAddress('');
        window.localStorage.removeItem(MILVUS_ADDRESS);
      }
    };
    check();
  }, [setAddress]);

  return (
    <Provider value={{ isAuth, address, setAddress }}>
      {props.children}
    </Provider>
  );
};
