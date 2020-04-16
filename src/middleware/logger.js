const logger = (store) => (next) => (action = {}) => {
  const { type, payload } = action;
  const log = `Action: ${ type }
Payload: ${ JSON.stringify(payload) }`;

  console.log(log);
  return next(action);
};

export default logger;
