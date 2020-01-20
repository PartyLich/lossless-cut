import withReset from './withReset';


const START_TEXT_SET = 'CutTimeInput/START_TEXT_SET';
const END_TEXT_SET = 'CutTimeInput/END_TEXT_SET';
const STATE_RESET = 'CutTimeInput/STATE_RESET';


export const resetState = () => ({
  type: STATE_RESET,
});

export const setStartText = (startText) => ({
  type: START_TEXT_SET,
  payload: { startText },
});

export const setEndText = (endText) => ({
  type: END_TEXT_SET,
  payload: { endText },
});


const initialState = {
  startText: '',
  endText: '',
};

const cutTime = (state = initialState, { type, payload } = {}) => {
  switch (type) {
    case START_TEXT_SET:
    case END_TEXT_SET:
    case STATE_RESET:
      return { ...state, ...payload };

    default:
      return state;
  }
};

export default withReset(STATE_RESET, cutTime);
