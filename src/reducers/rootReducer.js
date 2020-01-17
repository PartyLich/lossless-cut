import combineReducers from './combineReducers';
import withReset from './withReset';
import cutSegments from './cutSegments';
import globalState from './globalState';
import localState from './localState';
import cutTime from './cutTimeInput';

const ROOT_RESET = 'rootReducer/ROOT_RESET';

export const resetRoot = () => ({
  type: ROOT_RESET,
});

const logger = (_, { type, payload } = {}) => {
  const log = `Action: ${ type }
Payload: ${ JSON.stringify(payload) }`;

  switch (type) {
    default:
      console.log(log);
      return null;
  }
};

const rootReducer = combineReducers({
  globalState,
  localState,
  cutSegments,
  cutTime,
  logger,
});

export default withReset(ROOT_RESET, rootReducer);
