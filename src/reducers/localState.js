import withReset from './withReset';


const WORKING_TOGGLE = 'localState/WORKING_TOGGLE';
const WORKING_SET = 'localState/WORKING_SET';
const PLAYING_TOGGLE = 'localState/PLAYING_TOGGLE';
const PLAYING_SET = 'localState/PLAYING_SET';
const DURATION_SET = 'localState/DURATION_SET';
const FILE_FORMAT_SET = 'localState/FILE_FORMAT_SET';
const FILE_PATH_SET = 'localState/FILE_PATH_SET';
const HELP_TOGGLE = 'localState/HELP_TOGGLE';
const ROTATION_INC = 'localState/ROTATION_INC';
const STATE_RESET = 'localState/STATE_RESET';

export const resetLocalState = () => ({
  type: STATE_RESET,
});

export const setWorking = (working) => ({
  type: WORKING_SET,
  payload: { working },
});

export const setPlaying = (playing) => ({
  type: PLAYING_SET,
  payload: { playing },
});

export const setDuration = (duration) => ({
  type: DURATION_SET,
  payload: { duration: Math.max(0, duration) },
});

export const setFileFormat = (fileFormat) => ({
  type: FILE_FORMAT_SET,
  payload: { fileFormat },
});

export const setFilePath = (filePath) => ({
  type: FILE_PATH_SET,
  payload: { filePath },
});

export const increaseRotation = () => ({
  type: ROTATION_INC,
});

export const toggleHelp = () => ({
  type: HELP_TOGGLE,
  payload: 'helpVisible',
});


const initialState = {
  working: false,
  filePath: '', // Setting video src="" prevents memory leak in chromium
  html5FriendlyPath: undefined,
  userHtml5ified: false,
  playing: false,
  currentTime: undefined,
  duration: 0,
  fileFormat: '',
  detectedFileFormat: undefined,
  streams: [],
  rotation: 360,
  cutProgress: undefined,
  startTimeOffset: 0,
  framePath: undefined,
  rotationPreviewRequested: false,
  helpVisible: false,
};

const localState = (state = initialState, { type, payload } = {}) => {
  switch (type) {
    case PLAYING_TOGGLE:
      return { ...state, playing: !state.playing };

    case WORKING_TOGGLE:
      return { ...state, working: !state.working };
    case HELP_TOGGLE:
      return { ...state, [payload]: !state[payload] };

    case WORKING_SET:
    case PLAYING_SET:
    case DURATION_SET:
    case FILE_FORMAT_SET:
    case FILE_PATH_SET:
      return { ...state, ...payload };

    case ROTATION_INC:
      return { ...state, rotation: (state.rotation + 90) % 450 };

    default:
      return state;
  }
};

export default withReset(STATE_RESET, localState);
