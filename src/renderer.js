import { ipcRenderer, remote } from 'electron';
import React from 'react';
import ReactDOM from 'react-dom';

import {
  App,
  Provider,
  withStore,
} from './components';

function initialRender(event, ...args) {
  ReactDOM.render(
    <Provider>
      {withStore(App)()}
    </Provider>,
    document.getElementById('app')
  );

  ipcRenderer.send('renderer-ready');
}

ipcRenderer.on('initial-render', initialRender);

console.log('Version', remote.app.getVersion());
