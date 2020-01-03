const combineReducers = (obj = {}) => (state = {}, action = {}) => {
  const nextState = {};
  for (const [key, reducer] of Object.entries(obj)) {
    nextState[key] = reducer(state[key], action);
  }
  return nextState;
};

export default combineReducers;
