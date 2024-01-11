import { createContext, useEffect, useState } from 'react';
import { MILVUS_CLIENT_ID, LOGIN_USERNAME } from '@/consts';
import { AuthContextType } from './Types';

export const authContext = createContext<AuthContextType>({
  isAuth: false,
  address: '',
  username: '',
  isManaged: false,
  logout: () => {},
  setAddress: () => {},
  setUsername: () => {},
  setIsAuth: () => {},
});

const { Provider } = authContext;
export const AuthProvider = (props: { children: React.ReactNode }) => {
  // get milvus address from local storage
  const [address, setAddress] = useState<string>(
    window.localStorage.getItem(MILVUS_CLIENT_ID) || ''
  );
  // get login username from local storage
  const [username, setUsername] = useState<string>(
    window.localStorage.getItem(LOGIN_USERNAME) || ''
  );
  const [isAuth, setIsAuth] = useState<boolean>(address !== '');
  // const isAuth = useMemo(() => !!address, [address]);

  const logout = () => {
    // remove user data from local storage
    window.localStorage.removeItem(MILVUS_CLIENT_ID);
    window.localStorage.removeItem(LOGIN_USERNAME);

    // update state
    setAddress('');
    setUsername('');
    setIsAuth(false);
  };

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
        logout,
        isManaged: address.includes('vectordb.zillizcloud.com'),
      }}
    >
      {props.children}
    </Provider>
  );
};
