import dayjs from 'dayjs';
import { useEffect, useRef } from 'react';
import { PollingTypeEnum } from '../consts/Polling';

export const useInterval = (
  callback: (isInterval?: boolean) => void,
  delay: number | null,
  type: PollingTypeEnum
) => {
  const savedCallback = useRef<(isInterval?: boolean) => void>(() => {});
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const cb = () => {
      console.log(
        `starting fetch data for ${type}`,
        dayjs().format('YYYY-MM-DD HH:mm:ss')
      );
      savedCallback.current(true);
    };

    if (delay !== null) {
      let timer = setInterval(cb, delay);
      return () => clearInterval(timer);
    }
  }, [delay, type]);
};
