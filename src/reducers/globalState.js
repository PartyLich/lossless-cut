const STRIP_AUDIO_TOGGLE = 'globalState/STRIP_AUDIO_TOGGLE';
const CAPTURE_FORMAT_TOGGLE = 'globalState/CAPTURE_FORMAT_TOGGLE';
const KEYFRAME_CUT_TOGGLE = 'globalState/KEYFRAME_CUT_TOGGLE';
const AUTO_MERGE_TOGGLE = 'globalState/AUTO_MERGE_TOGGLE';
const ALL_STREAMS_TOGGLE = 'globalState/ALL_STREAMS_TOGGLE';
const CUSTOM_DIR_SET = 'globalState/CUSTOM_DIR_SET';

/**
 * @return {object} flux standard action
 */
export const toggleCaptureFormat = () => ({
  type: CAPTURE_FORMAT_TOGGLE,
});

export const toggleAllStreams = () => ({
  type: ALL_STREAMS_TOGGLE,
  payload: 'includeAllStreams',
});

export const toggleStripAudio = () => ({
  type: STRIP_AUDIO_TOGGLE,
  payload: 'stripAudio',
});

export const toggleKeyframeCut = () => ({
  type: KEYFRAME_CUT_TOGGLE,
  payload: 'keyframeCut',
});

export const toggleAutoMerge = () => ({
  type: AUTO_MERGE_TOGGLE,
  payload: 'autoMerge',
});

export const setCustomDir = (dir) => ({
  type: CUSTOM_DIR_SET,
  payload: { customOutDir: dir || '' },
});

const isPng = (state) => state.captureFormat === 'png';

const initialState = {
  stripAudio: false,
  includeAllStreams: true,
  captureFormat: 'jpeg',
  customOutDir: '',
  keyframeCut: true,
  autoMerge: false,
};

/** globalState reducer
 * @param {object} state current state
 * @param {object} action flux standard action
 * @return {object} next state
 */
const globalState = (state = initialState, { type, payload } = {}) => {
  switch (type) {
    case STRIP_AUDIO_TOGGLE:
    case KEYFRAME_CUT_TOGGLE:
    case AUTO_MERGE_TOGGLE:
    case ALL_STREAMS_TOGGLE:
      return { ...state, [payload]: !state[payload] };

    case CAPTURE_FORMAT_TOGGLE:
      return { ...state, captureFormat: isPng(state) ? 'jpeg' : 'png' };

    case CUSTOM_DIR_SET:
      return { ...state, ...payload };

    default:
      // throw new Error(`unknown action type ${ type }`);
      return state;
  }
};

export default globalState;
