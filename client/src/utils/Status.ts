import { StatusEnum } from '../components/status/Types';

type TaskStatusType = 'success' | 'error' | 'loading';

export const getStatusType = (status: StatusEnum): TaskStatusType => {
  const loadingList: StatusEnum[] = [];
  const successList = [StatusEnum.loaded];

  if (loadingList.includes(status)) {
    return 'loading';
  }

  if (successList.includes(status)) {
    return 'success';
  }

  return 'error';
};
