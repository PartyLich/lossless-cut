// @flow
import type { TypedFSA } from './types';
import withReset from './withReset';


const WORKING_SET: 'localState/WORKING_SET' = 'localState/WORKING_SET';
const PLAYING_SET: 'localState/PLAYING_SET' = 'localState/PLAYING_SET';
const CUT_PROGRESS_SET: 'localState/CUT_PROGRESS_SET' = 'localState/CUT_PROGRESS_SET';
const DURATION_SET: 'localState/DURATION_SET' = 'localState/DURATION_SET';
const FILE_FORMAT_SET: 'localState/FILE_FORMAT_SET' = 'localState/FILE_FORMAT_SET';
const FILE_PATH_SET: 'localState/FILE_PATH_SET' = 'localState/FILE_PATH_SET';
const FRAME_PATH_SET: 'localState/FRAME_PATH_SET' = 'localState/FRAME_PATH_SET';
const HELP_TOGGLE: 'localState/HELP_TOGGLE' = 'localState/HELP_TOGGLE';
const ROTATION_INC: 'localState/ROTATION_INC' = 'localState/ROTATION_INC';
const STATE_RESET: 'localState/STATE_RESET' = 'localState/STATE_RESET';

type ResetLocalStateAction = TypedFSA<typeof STATE_RESET, void>;
type SetWorkingAction = TypedFSA<typeof WORKING_SET, {| working: boolean |}>;
type SetPlayingAction = TypedFSA<typeof PLAYING_SET, {| playing: boolean |}>;
type SetCutProgressAction =
        TypedFSA<typeof CUT_PROGRESS_SET, {| cutProgress: number |}>;
type SetDurationAction = TypedFSA<typeof DURATION_SET, {| duration: number |}>;
type SetFileFormatAction =
        TypedFSA<typeof FILE_FORMAT_SET, {| fileFormat: string |}>;
type SetFilePathAction = TypedFSA<typeof FILE_PATH_SET, {| filePath: string |}>;
type SetFramePathAction =
        TypedFSA<typeof FRAME_PATH_SET, {| framePath: string |}>;
type IncreaseRotationAction = TypedFSA<typeof ROTATION_INC, void>;
type ToggleHelpAction = TypedFSA<typeof HELP_TOGGLE, string>;

type Action =
    | ResetLocalStateAction
    | SetWorkingAction
    | SetPlayingAction
    | SetCutProgressAction
    | SetDurationAction
    | SetFileFormatAction
    | SetFilePathAction
    | SetFramePathAction
    | IncreaseRotationAction
    | ToggleHelpAction
    ;

export const resetLocalState = (): ResetLocalStateAction => ({
  type: STATE_RESET,
});

export const setWorking = (working: boolean): SetWorkingAction => ({
  type: WORKING_SET,
  payload: { working },
});

export const setPlaying = (playing: boolean): SetPlayingAction => ({
  type: PLAYING_SET,
  payload: { playing },
});

export const setCutProgress = (cutProgress: number): SetCutProgressAction => ({
  type: CUT_PROGRESS_SET,
  payload: { cutProgress },
});

export const setDuration = (duration: number): SetDurationAction => ({
  type: DURATION_SET,
  payload: { duration: Math.max(0, duration) },
});

export const setFileFormat = (fileFormat: string): SetFileFormatAction => ({
  type: FILE_FORMAT_SET,
  payload: { fileFormat },
});

export const setFilePath = (filePath: string): SetFilePathAction => ({
  type: FILE_PATH_SET,
  payload: { filePath },
});

export const setFramePath = (framePath: string): SetFramePathAction => ({
  type: FRAME_PATH_SET,
  payload: { framePath },
});

export const increaseRotation = (): IncreaseRotationAction => ({
  type: ROTATION_INC,
});

export const toggleHelp = (): ToggleHelpAction => ({
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
  framePath: '',
  rotationPreviewRequested: false,
  helpVisible: false,
};

const localState = (state = initialState, action: Action) => {
  switch (action.type) {
    case HELP_TOGGLE:
      return action.payload
        ? { ...state, [action.payload]: !state[action.payload] }
        : state;

    case WORKING_SET:
    case PLAYING_SET:
    case CUT_PROGRESS_SET:
    case DURATION_SET:
    case FILE_FORMAT_SET:
    case FILE_PATH_SET:
    case FRAME_PATH_SET:
      return { ...state, ...action.payload };

    case ROTATION_INC:
      return { ...state, rotation: (state.rotation + 90) % 450 };

    default:
      return state;
  }
};

export default withReset(STATE_RESET, localState);
