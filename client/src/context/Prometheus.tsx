import React, { createContext, useContext, useEffect, useState } from 'react';
import { PrometheusContextType } from './Types';
import { authContext } from '../context/Auth';
import {
  LAST_TIME_WITH_PROMETHEUS,
  LAST_TIME_PROMETHEUS_ADDRESS,
  LAST_TIME_PROMETHEUS_INSTANCE,
  LAST_TIME_PROMETHEUS_NAMESPACE,
} from '../consts/Localstorage';
import { formatPrometheusAddress } from '../utils/Format';
import { PrometheusHttp } from '../http/Prometheus';
import {
  PROMETHEUS_ADDRESS,
  PROMETHEUS_INSTANCE_NAME,
  PROMETHEUS_NAMESPACE,
  WITH_PROMETHEUS,
} from '../consts/Prometheus';

export const prometheusContext = createContext<PrometheusContextType>({
  withPrometheus: false,
  setWithPrometheus: () => {},
  isPrometheusReady: false,
  prometheusAddress: '',
  prometheusInstance: '',
  prometheusNamespace: '',
  setPrometheusAddress: () => {},
  setPrometheusInstance: () => {},
  setPrometheusNamespace: () => {},
});

const { Provider } = prometheusContext;
export const PrometheusProvider = (props: { children: React.ReactNode }) => {
  const { isAuth } = useContext(authContext);

  const [withPrometheus, setWithPrometheus] = useState(
    !!(
      window.localStorage.getItem(LAST_TIME_WITH_PROMETHEUS) || WITH_PROMETHEUS
    )
  );
  const [prometheusAddress, setPrometheusAddress] = useState(
    window.localStorage.getItem(LAST_TIME_PROMETHEUS_ADDRESS) ||
      PROMETHEUS_ADDRESS
  );
  const [prometheusInstance, setPrometheusInstance] = useState(
    window.localStorage.getItem(LAST_TIME_PROMETHEUS_INSTANCE) ||
      PROMETHEUS_INSTANCE_NAME
  );
  const [prometheusNamespace, setPrometheusNamespace] = useState(
    window.localStorage.getItem(LAST_TIME_PROMETHEUS_NAMESPACE) ||
      PROMETHEUS_NAMESPACE
  );

  const [isPrometheusReady, setIsPrometheusReady] = useState(false);

  useEffect(() => {
    if (!isAuth) return;
    if (withPrometheus) {
      const prometheusAddressformat =
        formatPrometheusAddress(prometheusAddress);
      PrometheusHttp.setPrometheus({
        prometheusAddress: prometheusAddressformat,
        prometheusInstance,
        prometheusNamespace,
      }).then(({ isReady }: { isReady: boolean }) => {
        console.log('prometheus is ready?', isReady);
        if (isReady) {
          window.localStorage.setItem(LAST_TIME_WITH_PROMETHEUS, 'true');
          window.localStorage.setItem(
            LAST_TIME_PROMETHEUS_ADDRESS,
            prometheusAddress
          );
          window.localStorage.setItem(
            LAST_TIME_PROMETHEUS_INSTANCE,
            prometheusInstance
          );
          window.localStorage.setItem(
            LAST_TIME_PROMETHEUS_NAMESPACE,
            prometheusNamespace
          );
        }
        setIsPrometheusReady(isReady);
      });
    } else {
      setIsPrometheusReady(false);
    }
  }, [isAuth, setIsPrometheusReady]);

  return (
    <Provider
      value={{
        withPrometheus,
        setWithPrometheus,
        isPrometheusReady,
        prometheusAddress,
        prometheusInstance,
        prometheusNamespace,
        setPrometheusAddress,
        setPrometheusInstance,
        setPrometheusNamespace,
      }}
    >
      {props.children}
    </Provider>
  );
};
