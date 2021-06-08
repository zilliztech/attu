import { StatusEnum } from '../components/status/Types';

type TaskStatusType = 'success' | 'error' | 'loading';

export const getStatusType = (status: StatusEnum): TaskStatusType => {
  const loadingList = [StatusEnum.creating];
  const successList = [StatusEnum.running];

  if (loadingList.includes(status)) {
    return 'loading';
  }

  if (successList.includes(status)) {
    return 'success';
  }

  return 'error';
};
