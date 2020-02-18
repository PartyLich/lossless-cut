import { combineReducers } from 'redux';

import withReset from './withReset';
import cutSegments from './cutSegments';
import globalState from './globalState';
import localState from './localState';
import cutTime from './cutTimeInput';


const ROOT_RESET = 'rootReducer/ROOT_RESET';

export const resetRoot = () => ({
  type: ROOT_RESET,
});

const rootReducer = combineReducers({
  globalState,
  localState,
  cutSegments,
  cutTime,
});

export default withReset(ROOT_RESET, rootReducer);
