import { createContext, useState } from 'react';
import { AuthContextType } from './Types';

export const authContext = createContext<AuthContextType>({
  isAuth: false,
  setIsAuth: () => {},
  address: '',
  setAddress: () => {},
});

const { Provider } = authContext;

export const AuthProvider = (props: { children: React.ReactNode }) => {
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [address, setAddress] = useState<string>('');

  return (
    <Provider value={{ isAuth, setIsAuth, address, setAddress }}>
      {props.children}
    </Provider>
  );
};
