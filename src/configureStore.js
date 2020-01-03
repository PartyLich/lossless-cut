import React, { useReducer } from 'react';

import rootReducer from './reducers';


export default function configureStore(initialState) {
  const [state, dispatch] = useReducer(rootReducer, initialState, rootReducer);
  return { state, dispatch };
}
