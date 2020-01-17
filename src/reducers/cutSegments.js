import combineReducers from './combineReducers';
import createSegment from '../createSegment';
import withReset from './withReset';


const CUT_TIME_SET = 'cutSegments/CUT_TIME_SET';
const CUTSEGMENT_REMOVE = 'cutSegments/CUTSEGMENT_REMOVE';
const CUTSEGMENT_ADD = 'cutSegments/CUTSEGMENT_ADD';
const CURRENT_SEG_SET = 'cutSegments/CURRENT_SEG_SET';
const STATE_RESET = 'cutSegments/STATE_RESET';

/**
 * @param {number} i segment index
 * @param {string} segmentType start|end
 * @param {number} time
 * @return {object} flux standard action
 */
export const setCutTime = (i, segmentType, time) => ({
  type: CUT_TIME_SET,
  payload: {
    i,
    segmentType,
    time,
  },
});

export const setCurrentSeg = (i) => ({
  type: CURRENT_SEG_SET,
  payload: Math.max(0, i),
});

export const addCutSegment = (start, end) => ({
  type: CUTSEGMENT_ADD,
  payload: {
    start,
    end,
  },
});

export const removeCutSegment = (i) => ({
  type: CUTSEGMENT_REMOVE,
  payload: i,
});

export const resetCutSegmentState = () => ({
  type: STATE_RESET,
});


const setSegCutTime = (state, { i, segmentType, time }) => {
  const cutSegments = [...state];
  cutSegments[i][segmentType] = time;
  return cutSegments;
};

const removeElement = (arr, index) => {
  if (arr.length < 2) return arr;

  // return arr.slice(0, index).concat(arr.slice(index + 1));
  return [...arr.slice(0, index), ...arr.slice(index + 1)];
};

const cutSegmentsState = [createSegment()];
const cutSegments = (state = cutSegmentsState, { type, payload } = {}) => {
  switch (type) {
    case CUT_TIME_SET:
      return setSegCutTime(state, payload);
    case CUTSEGMENT_ADD:
      return [...state, createSegment(payload)];
    case CUTSEGMENT_REMOVE:
      return removeElement(state, payload);
    default:
      return state;
  }
};


const initialState = 0;

/**
 * @param {object} state current state
 * @param {object} action flux standard action
 * @return {object} next state
 */
const currentSeg = (state = initialState, { type, payload } = {}) => {
  switch (type) {
    case CURRENT_SEG_SET:
      return payload;

    default:
      // throw new Error(`unknown action type ${ type }`);
      return state;
  }
};

export default withReset(STATE_RESET, combineReducers({
  currentSeg,
  cutSegments,
}));
