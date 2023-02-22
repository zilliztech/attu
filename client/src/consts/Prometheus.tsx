export const WITH_PROMETHEUS = (window as any)?._env_?.WITH_PROMETHEUS || '';

export const PROMETHEUS_ADDRESS =
  (window as any)?._env_?.PROMETHEUS_ADDRESS || '';

export const PROMETHEUS_INSTANCE_NAME =
  (window as any)?._env_?.PROMETHEUS_INSTANCE_NAME || '';

export const PROMETHEUS_NAMESPACE =
  (window as any)?._env_?.PROMETHEUS_NAMESPACE || '';

export const DEFAULT_HEALTHY_THRESHOLD_CPU = 1;
export const DEFAULT_HEALTHY_THRESHOLD_MEMORY = 8 * 1024 * 1024 * 1024;
