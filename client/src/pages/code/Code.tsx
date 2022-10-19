import { FC, useCallback, useEffect, useState } from 'react';
import { useNavigationHook } from '../../hooks/Navigation';
import { ALL_ROUTER_TYPES } from '../../router/Types';

const Code: FC<any> = () => {
  useNavigationHook(ALL_ROUTER_TYPES.CODE);

  return <section className="page-wrapper">code </section>;
};

export default Code;
