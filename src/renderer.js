import { ipcRenderer, remote } from 'electron';
import React from 'react';
import ReactDOM from 'react-dom';

import {
  App,
  Provider,
  withStore,
} from './components';


ReactDOM.render(
  <Provider>
    {withStore(App)}
  </Provider>,
  document.getElementById('app')
);

ipcRenderer.send('renderer-ready');

console.log('Version', remote.app.getVersion());
