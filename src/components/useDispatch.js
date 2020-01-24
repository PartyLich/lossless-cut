// @flow
import { useContext } from 'react';

import { DispatchContext } from './Provider';


export const useDispatch = () => useContext(DispatchContext);

export default useDispatch;
