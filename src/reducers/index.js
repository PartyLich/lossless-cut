import combineReducers from './combineReducers';
import cutSegments from './cutSegments';
import globalState from './globalState';


const logger = (state = null, { type, payload } = {}) => {
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
  cutSegments,
  logger,
});

export default rootReducer;
