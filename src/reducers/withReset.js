const withReset = (type, reducer) => (state, action = {}) => {
  switch (action.type) {
    case type:
      return reducer(undefined, action);
    default:
      return reducer(state, action);
  }
};

export default withReset;
