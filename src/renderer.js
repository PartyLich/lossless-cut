import { ipcRenderer, remote } from 'electron';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import { App } from './components';
import { configureStore } from './configureStore';


const store = configureStore();

function initialRender(event) {
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('app')
  );

  ipcRenderer.send('renderer-ready');
}

ipcRenderer.on('initial-render', initialRender);

console.log('Version', remote.app.getVersion());
