import dayjs from 'dayjs';

export const getMonthOptions = (
  start: number
): { label: string; value: number }[] => {
  const current = dayjs().endOf('month').valueOf();
  let options: { label: string; value: number }[] = [];
  let month = dayjs(start).endOf('month').valueOf();

  while (month <= current) {
    options = [
      ...options,
      {
        label: dayjs(month).format('MMMM YYYY'),
        value: dayjs(month).endOf('month').valueOf(),
      },
    ];

    month = dayjs(month).add(1, 'M').valueOf();
  }

  return options;
};

export const formatDate = (time: number): string => {
  return dayjs(time * 1000).format('YYYY-MM-DD HH:mm:ss');
};
