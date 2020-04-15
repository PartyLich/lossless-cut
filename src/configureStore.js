import React, { useReducer } from 'react';
import { createStore, applyMiddleware } from 'redux';
import {
  forwardToRenderer,
  forwardToMain,
  getInitialStateRenderer,
} from 'electron-redux';
import isDev from 'electron-is-dev';


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
  const middleware = isDev
      ? [
        logger,
        forwardToRenderer, // IMPORTANT! This goes last
      ]
      : [
        forwardToRenderer, // IMPORTANT! This goes last
      ];

  return createStore(
      rootReducer,
      initialState,
      applyMiddleware(...middleware),
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
