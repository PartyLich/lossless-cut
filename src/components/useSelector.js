// @flow
import { useContext } from 'react';

import { StoreContext } from './Provider';


export const useSelector = (
    selector: ({}) => mixed,
    equalityFn: ?() => boolean,
) => {
  const store = useContext(StoreContext);
  return selector(store);
};

export default useSelector;
