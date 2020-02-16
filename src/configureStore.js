import React, { useReducer } from 'react';
import { createStore } from 'redux';

import rootReducer from './reducers';


export default function useStore(initialState) {
  const [state, dispatch] = useReducer(rootReducer, initialState, rootReducer);
  return { state, dispatch };
}

let store = null;

export function configureStore(initialState) {
  if (!store) store = createStore(rootReducer, initialState);
  return store;
}
