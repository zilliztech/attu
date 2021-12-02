import dayjs from 'dayjs';
import { formatUtcToMilvus } from '../utils/Format';
import { useMemo, useState } from 'react';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { useTranslation } from 'react-i18next';

export const useTimeTravelHook = () => {
  const [timeTravel, setTimeTravel] = useState<MaterialUiPickersDate>(null);
  const { t: searchTrans } = useTranslation('search');

  const timeTravelInfo = useMemo(() => {
    const timestamp = dayjs(timeTravel).valueOf();
    return {
      label: timeTravel
        ? ` ${searchTrans('timeTravelPrefix')} ${dayjs(timeTravel).format(
            'YYYY-MM-DD HH:mm:ss'
          )}`
        : searchTrans('timeTravel'),
      timestamp: timeTravel ? formatUtcToMilvus(timestamp) : undefined,
    };
  }, [searchTrans, timeTravel]);

  const handleDateTimeChange = (value: MaterialUiPickersDate) => {
    setTimeTravel(value);
  };

  return {
    timeTravel,
    setTimeTravel,
    handleDateTimeChange,
    timeTravelInfo,
  };
};
