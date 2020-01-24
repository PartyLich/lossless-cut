// @flow
import React from 'react';
import type { ComponentType } from 'react';

import { useSelector } from './useSelector';


export const connect = (select: ({}) => mixed) => (Component: ComponentType<{}>) => (props: ?{}) => {
  const state = useSelector(select);
  const mappedState = {
    ...state,
    ...props,
  };

  return <Component {...mappedState} />;
};

export default connect;
