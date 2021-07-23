import { Theme, makeStyles, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { ITextfieldConfig } from '../../components/customInput/Types';
import icons from '../../components/icons/Icons';
import ConnectContainer from './ConnectContainer';
import CustomInput from '../../components/customInput/CustomInput';
import {
  useContext,
  // useEffect,
  useMemo,
  useState,
} from 'react';
import { formatForm } from '../../utils/Form';
import { useFormValidation } from '../../hooks/Form';
import CustomButton from '../../components/customButton/CustomButton';
import { useHistory } from 'react-router-dom';
import { authContext } from '../../context/Auth';
import { MilvusHttp } from '../../http/Milvus';
import { rootContext } from '../../context/Root';
import { MILVUS_ADDRESS } from '../../consts/Localstorage';
import { formatAddress } from '../../utils/Format';
// import { io } from "socket.io-client";

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',

    padding: theme.spacing(0, 3),
  },
  titleWrapper: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(3),
    margin: '0 auto',

    '& .title': {
      margin: 0,
      color: '#323232',
      fontWeight: 'bold',
    },
  },
  logo: {
    width: '42px',
    height: 'auto',
    marginRight: theme.spacing(2),
  },
  input: {
    margin: theme.spacing(3, 0, 0.5),
  },
}));
const MILVUS_URL =
  ((window as any)._env_ && (window as any)._env_.MILVUS_URL) || '';

const Connect = () => {
  const history = useHistory();
  const { setAddress } = useContext(authContext);
  const { openSnackBar } = useContext(rootContext);
  const classes = useStyles();
  const { t: commonTrans } = useTranslation();
  const { t: warningTrans } = useTranslation('warning');
  const milvusTrans: { [key in string]: string } = commonTrans('milvus');
  const { t: btnTrans } = useTranslation('btn');
  const { t: successTrans } = useTranslation('success');

  const [form, setForm] = useState({
    address: MILVUS_URL,
  });
  const checkedForm = useMemo(() => {
    const { address } = form;
    return formatForm({ address });
  }, [form]);
  const { validation, checkIsValid, disabled } = useFormValidation(checkedForm);

  const Logo = icons.milvus;

  const handleInputChange = (value: string) => {
    setForm({ address: value });
  };

  const handleConnect = async () => {
    const address = formatAddress(form.address);
    await MilvusHttp.connect(address);
    openSnackBar(successTrans('connect'));
    setAddress(address);
    window.localStorage.setItem(MILVUS_ADDRESS, address);
    history.push('/');
  };

  const addressInputConfig: ITextfieldConfig = {
    label: milvusTrans.address,
    key: 'address',
    onChange: handleInputChange,
    variant: 'filled',
    className: classes.input,
    placeholder: milvusTrans.address,
    fullWidth: true,
    validations: [
      {
        rule: 'require',
        errorText: warningTrans('required', { name: milvusTrans.address }),
      },
    ],
    defaultValue: form.address,
  };

  // test code for socket
  // useEffect(() => {
  //   const socket = io('http://localhost:3002');
  //   socket.on('connect', function () {
  //     console.log('Connected');

  //     socket.emit('identity', 0, (res: any) =>
  //       console.log(res));

  //     socket.emit('events', { test: 'events' });

  //     socket.emit('senddata', { test: 'senddata' });
  //   });
  //   socket.on('events', (data: any) => {
  //     console.log('event', data);
  //   });
  //   socket.on('senddata', (data: any) => {
  //     console.log('senddata', data);
  //   });
  //   socket.on('exception', (data: any) => {
  //     console.log('event', data);
  //   });
  //   socket.on('disconnect', () => {
  //     console.log('Disconnected');
  //   });
  // }, []);

  return (
    <ConnectContainer>
      <section className={classes.wrapper}>
        <div className={classes.titleWrapper}>
          <Logo classes={{ root: classes.logo }} />
          <Typography variant="h2" className="title">
            {milvusTrans.admin}
          </Typography>
        </div>
        <CustomInput
          type="text"
          textConfig={addressInputConfig}
          checkValid={checkIsValid}
          validInfo={validation}
        />
        <CustomButton
          variant="contained"
          disabled={form.address ? false : disabled}
          onClick={handleConnect}
        >
          {btnTrans('connect')}
        </CustomButton>
      </section>
    </ConnectContainer>
  );
};

export default Connect;
