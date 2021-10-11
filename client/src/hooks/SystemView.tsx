
import { useRef, useEffect } from 'react';

export const useInterval = (callback: Function, delay: number) => {
  const savedCallback = useRef() as { current: any };

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}