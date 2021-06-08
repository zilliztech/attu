import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { rootContext } from '../../context/Root';

const Dashboard = () => {
  const { setDialog } = useContext(rootContext);

  const openDialog = () => {
    setDialog({
      open: true,
      type: 'notice',
      params: {
        title: 'test',
        component: <></>,
        confirm: () => new Promise((res, rej) => res(true)),
        cancel: () => new Promise((res, rej) => res(true)),
      },
    });
  };

  const { t } = useTranslation('btn');

  return (
    <section>
      <button onClick={openDialog}>{t('confirm')}</button>
    </section>
  );
};

export default Dashboard;
