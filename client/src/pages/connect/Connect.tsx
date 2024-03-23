import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import ConnectContainer from './ConnectContainer';
import { AuthForm } from './AuthForm';
import { authContext } from '@/context/Auth';
import GlobalEffect from '@/components/layout/GlobalEffect';

const Connect = () => {
  const { isAuth } = useContext(authContext);

  return (
    <>
      {isAuth && <Navigate to="/" replace={true} />}
      <GlobalEffect>
        <ConnectContainer />
      </GlobalEffect>
    </>
  );
};

export default Connect;
