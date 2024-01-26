import { createContext, useEffect, useState } from 'react';
import { MILVUS_CLIENT_ID, LOGIN_USERNAME, LAST_TIME_ADDRESS } from '@/consts';
import { AuthContextType } from './Types';

export const authContext = createContext<AuthContextType>({
  isAuth: false,
  clientId: '',
  address: '',
  username: '',
  isManaged: false,
  logout: () => {},
  setAddress: () => {},
  setUsername: () => {},
  setIsAuth: () => {},
  setClientId: () => {},
});

const { Provider } = authContext;
export const AuthProvider = (props: { children: React.ReactNode }) => {
  // get milvus address from local storage
  const [address, setAddress] = useState<string>(
    window.localStorage.getItem(LAST_TIME_ADDRESS) || ''
  );
  // get login username from local storage
  const [username, setUsername] = useState<string>(
    window.localStorage.getItem(LOGIN_USERNAME) || ''
  );

  // get milvus address from local storage
  const [clientId, setClientId] = useState<string>(
    window.localStorage.getItem(MILVUS_CLIENT_ID) || ''
  );
  const [isAuth, setIsAuth] = useState<boolean>(clientId !== '');
  // const isAuth = useMemo(() => !!address, [address]);

  useEffect(() => {
    document.title = address ? `${address} - Attu` : 'Attu';
  }, [address, username]);

  const logout = () => {
    // remove user data from local storage
    window.localStorage.removeItem(MILVUS_CLIENT_ID);
    window.localStorage.removeItem(LOGIN_USERNAME);

    // update state
    setAddress('');
    setUsername('');
    setIsAuth(false);
  };

  return (
    <Provider
      value={{
        isAuth,
        clientId,
        address,
        username,
        setAddress,
        setUsername,
        setIsAuth,
        setClientId,
        logout,
        isManaged: address.includes('vectordb.zillizcloud.com'),
      }}
    >
      {props.children}
    </Provider>
  );
};
