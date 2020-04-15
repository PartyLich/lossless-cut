import React, { useReducer } from 'react';
import { createStore, applyMiddleware } from 'redux';
import {
  forwardToRenderer,
  forwardToMain,
  getInitialStateRenderer,
} from 'electron-redux';


import rootReducer from './reducers';
import { logger } from './middleware';


export default function useStore(initialState) {
  const [state, dispatch] = useReducer(rootReducer, initialState, rootReducer);
  return { state, dispatch };
}

let store = null;

export function configureStore(initialState) {
  if (!store) store = createStore(rootReducer, initialState);
  return store;
}

export function configureMainStore(initialState) {
  return createStore(
      rootReducer,
      initialState,
      applyMiddleware(
          logger,
          forwardToRenderer, // IMPORTANT! This goes last
      ),
  );
}

export function configureRendererStore() {
  return createStore(
      rootReducer,
      getInitialStateRenderer(),
      applyMiddleware(
          forwardToMain, // IMPORTANT! This goes first
      ),
  );
}
