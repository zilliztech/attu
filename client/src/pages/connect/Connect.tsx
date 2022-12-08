import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import ConnectContainer from './ConnectContainer';
import { AuthForm } from './AuthForm';
import { authContext } from '../../context/Auth';

const Connect = () => {
  const { isAuth } = useContext(authContext);

  return (
    <>
      {isAuth && <Navigate to="/" replace={true} />}
      <ConnectContainer>
        <AuthForm />
      </ConnectContainer>
    </>
  );
};

export default Connect;
