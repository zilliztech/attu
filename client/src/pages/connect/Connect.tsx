import { Theme, makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { ITextfieldConfig } from '../../components/customInput/Types';
import icons from '../../components/icons/Icons';
import ConnectContainer from './ConnectContainer';
import CustomInput from '../../components/customInput/CustomInput';
import { useMemo, useState } from 'react';
import { formatForm } from '../../utils/Form';
import { useFormValidation } from '../../hooks/Form';
import CustomButton from '../../components/customButton/CustomButton';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',

    padding: theme.spacing(0, 3),
  },
  titleWrapper: {
    display: 'flex',
    padding: theme.spacing(3),
    margin: '0 auto',

    '& h2': {
      margin: 0,
      color: '#323232',
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

const Connect = () => {
  const history = useHistory();

  const classes = useStyles();
  const { t } = useTranslation();
  const { t: warningTrans } = useTranslation('warning');
  const milvusTrans: { [key in string]: string } = t('milvus');
  const { t: btnTrans } = useTranslation('btn');

  const [form, setForm] = useState({
    address: '',
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

  const handleConnect = () => {
    console.log('connect address', form.address);
    history.push('/');
  };

  const addressInputConfig: ITextfieldConfig = {
    label: milvusTrans.address,
    key: 'address',
    onChange: handleInputChange,
    variant: 'filled',
    className: classes.input,
    placeholder: milvusTrans.addaress,
    fullWidth: true,
    validations: [
      {
        rule: 'require',
        errorText: warningTrans('required', { name: milvusTrans.address }),
      },
    ],
  };

  return (
    <ConnectContainer>
      <section className={classes.wrapper}>
        <div className={classes.titleWrapper}>
          <Logo classes={{ root: classes.logo }} />
          <h2>{milvusTrans.admin}</h2>
        </div>
        <CustomInput
          type="text"
          textConfig={addressInputConfig}
          checkValid={checkIsValid}
          validInfo={validation}
        />
        <CustomButton
          variant="contained"
          disabled={disabled}
          onClick={handleConnect}
        >
          {btnTrans('connect')}
        </CustomButton>
      </section>
    </ConnectContainer>
  );
};

export default Connect;
