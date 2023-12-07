import { createContext, useEffect, useState } from 'react';
import { MILVUS_ADDRESS, LOGIN_USERNAME } from '@/consts';
import { MilvusService } from '@/http';
import { AuthContextType } from './Types';

export const authContext = createContext<AuthContextType>({
  isAuth: false,
  address: '',
  username: '',
  isManaged: false,
  setAddress: () => {},
  setUsername: () => {},
  setIsAuth: () => {},
});

const { Provider } = authContext;
export const AuthProvider = (props: { children: React.ReactNode }) => {
  // get milvus address from local storage
  const [address, setAddress] = useState<string>(
    window.localStorage.getItem(MILVUS_ADDRESS) || ''
  );
  // get login username from local storage
  const [username, setUsername] = useState<string>(
    window.localStorage.getItem(LOGIN_USERNAME) || ''
  );
  const [isAuth, setIsAuth] = useState<boolean>(address !== '');
  // const isAuth = useMemo(() => !!address, [address]);

  useEffect(() => {
    // check if the milvus is still available
    const check = async () => {
      const milvusAddress = window.localStorage.getItem(MILVUS_ADDRESS) || '';
      if (!milvusAddress) {
        return;
      }
      const res = await MilvusService.check(milvusAddress);
      setAddress(res.connected ? milvusAddress : '');
      res.connected && setIsAuth(true);
      if (!res.connected) {
        window.localStorage.removeItem(MILVUS_ADDRESS);
      }

      const username = window.localStorage.getItem(LOGIN_USERNAME) || '';
      if (!username) {
        return;
      }
      setUsername(username);
    };
    check();
  }, [setAddress, setUsername]);

  useEffect(() => {
    document.title = address ? `${address} - Attu` : 'Attu';
  }, [address, username]);

  return (
    <Provider
      value={{
        isAuth,
        address,
        username,
        setAddress,
        setUsername,
        setIsAuth,
        isManaged: address.includes('vectordb.zillizcloud.com'),
      }}
    >
      {props.children}
    </Provider>
  );
};
