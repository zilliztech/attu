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
  // get milvus address from local storage
  const [address, setAddress] = useState<string>(
    window.localStorage.getItem(MILVUS_ADDRESS) || ''
  );
  const isAuth = useMemo(() => !!address, [address]);

  useEffect(() => {
    // check if the milvus is still available
    const check = async () => {
      const milvusAddress = window.localStorage.getItem(MILVUS_ADDRESS) || '';
      if (!milvusAddress) {
        return;
      }
      try {
        const res = await MilvusHttp.check(milvusAddress);
        setAddress(res.connected ? milvusAddress : '');
        if (!res.connected) {
          window.localStorage.removeItem(MILVUS_ADDRESS);
        }
      } catch (error) {
        setAddress('');
        window.localStorage.removeItem(MILVUS_ADDRESS);
      }
    };
    check();
  }, [setAddress]);

  useEffect(() => {
    document.title = address ? `${address} - Milvus Insight` : 'Milvus Insight';
  }, [address]);

  return (
    <Provider value={{ isAuth, address, setAddress }}>
      {props.children}
    </Provider>
  );
};
