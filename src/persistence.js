// @flow
import ElectronStore from 'electron-store';

import { initialState } from './reducers/globalState';
import type { State as Settings } from './reducers/globalState';


const persistence = new ElectronStore();

// Loads app settings from persistent storage
export default function loadState(): { globalState: Settings } {
  const globalState: Settings = persistence.get('globalState', initialState);
  console.log(`globalState loaded: ${ JSON.stringify(globalState) }`);

  return {
    globalState,
  };
}

// Saves app settings to persistent storage
function saveState(settings: Settings) {
  persistence.set('globalState', settings);
}

export {
  loadState,
  saveState,
};
