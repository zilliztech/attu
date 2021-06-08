import { useContext } from 'react';
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

  return (
    <section>
      <button onClick={openDialog}>open</button>
    </section>
  );
};

export default Dashboard;
