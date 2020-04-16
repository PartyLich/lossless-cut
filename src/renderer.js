// @flow
import { ipcRenderer, remote } from 'electron';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { replayActionRenderer } from 'electron-redux';

import { App } from './components';
import { configureRendererStore } from './configureStore';


const store = configureRendererStore();
replayActionRenderer(store);
const container = document.getElementById('app');

function initialRender(event) {
  if (!container) throw Error('App container is missing from HTML');

  ReactDOM.render(
    <Provider store={store}>
        <App />
      </Provider>,
      container
  );

  ipcRenderer.send('renderer-ready');
}

ipcRenderer.on('initial-render', initialRender);

console.log('Version', remote.app.getVersion());
