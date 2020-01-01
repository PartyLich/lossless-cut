import combineReducers from './combineReducers';
import cutSegments from './cutSegments';


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
  cutSegments,
  logger,
});

export default rootReducer;
