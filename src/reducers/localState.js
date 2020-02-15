// @flow
import type { TypedFSA } from './types';
import withReset from './withReset';


const CURRENT_TIME_SET: 'localState/CURRENT_TIME_SET' = 'localState/CURRENT_TIME_SET';
const WORKING_SET: 'localState/WORKING_SET' = 'localState/WORKING_SET';
const PLAYING_SET: 'localState/PLAYING_SET' = 'localState/PLAYING_SET';
const CUT_PROGRESS_SET: 'localState/CUT_PROGRESS_SET' = 'localState/CUT_PROGRESS_SET';
const DETECTED_FORMAT_SET: 'localState/DETECTED_FORMAT_SET' = 'localState/DETECTED_FORMAT_SET';
const DURATION_SET: 'localState/DURATION_SET' = 'localState/DURATION_SET';
const FILE_FORMAT_SET: 'localState/FILE_FORMAT_SET' = 'localState/FILE_FORMAT_SET';
const FILE_PATH_SET: 'localState/FILE_PATH_SET' = 'localState/FILE_PATH_SET';
const FRAME_PATH_SET: 'localState/FRAME_PATH_SET' = 'localState/FRAME_PATH_SET';
const USERHTML5IFIED_SET: 'localState/USERHTML5IFIED_SET' = 'localState/USERHTML5IFIED_SET';
const HTML5FRIENDLYPATH_SET: 'localState/HTML5FRIENDLYPATH_SET' = 'localState/HTML5FRIENDLYPATH_SET';
const STREAMS_SET: 'localState/STREAMS_SET' = 'localState/STREAMS_SET';
const HELP_TOGGLE: 'localState/HELP_TOGGLE' = 'localState/HELP_TOGGLE';

const FILE_LOADED: 'localState/FILE_LOADED' = 'localState/FILE_LOADED';
const ROTATION_INC: 'localState/ROTATION_INC' = 'localState/ROTATION_INC';
const ROTATION_PREVIEW_SET: 'localState/ROTATION_PREVIEW_SET' = 'localState/ROTATION_PREVIEW_SET';
const STATE_RESET: 'localState/STATE_RESET' = 'localState/STATE_RESET';

type ResetLocalStateAction = TypedFSA<typeof STATE_RESET, void>;
type SetCurrentTimeAction =
        TypedFSA<typeof CURRENT_TIME_SET, {| currentTime: number |}>;
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
type FileLoadPayload = {|
  fileFormat: string,
  filePath: string,
|};
type FileLoadedEvent = TypedFSA<typeof FILE_LOADED, FileLoadPayload>;
type IncreaseRotationAction = TypedFSA<typeof ROTATION_INC, void>;
type SetRotationPreviewAction = TypedFSA<typeof ROTATION_PREVIEW_SET, {|
      rotationPreviewRequested: boolean
    |}>;
type SetUserHtml5ifiedAction = TypedFSA<typeof USERHTML5IFIED_SET, {|
      userHtml5ified: boolean
    |}>;
type SetHtml5FriendlyPathAction = TypedFSA<typeof HTML5FRIENDLYPATH_SET, {|
      html5FriendlyPath: ?string
    |}>;
type SetStreamsAction = TypedFSA<typeof STREAMS_SET, {| streams: Array<{}> |}>;
type SetDetectedFormatAction = TypedFSA<typeof DETECTED_FORMAT_SET, {|
      detectedFileFormat: string
    |}>;
type ToggleHelpAction = TypedFSA<typeof HELP_TOGGLE, string>;

type Action =
    | ResetLocalStateAction
    | SetWorkingAction
    | SetPlayingAction
    | SetCurrentTimeAction
    | SetCutProgressAction
    | SetDurationAction
    | SetDetectedFormatAction
    | SetFileFormatAction
    | SetFilePathAction
    | SetFramePathAction
    | SetRotationPreviewAction
    | FileLoadedEvent
    | IncreaseRotationAction
    | ToggleHelpAction
    | SetUserHtml5ifiedAction
    | SetHtml5FriendlyPathAction
    | SetStreamsAction
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

export const setCurrentTime = (currentTime: number): SetCurrentTimeAction => ({
  type: CURRENT_TIME_SET,
  payload: { currentTime },
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

export const setRotationPreview = (
    rotationPreviewRequested: boolean
): SetRotationPreviewAction => ({
  type: ROTATION_PREVIEW_SET,
  payload: { rotationPreviewRequested },
});

export const setUserHtml5ified = (
    userHtml5ified: boolean
): SetUserHtml5ifiedAction => ({
  type: USERHTML5IFIED_SET,
  payload: { userHtml5ified },
});

export const setHtml5FriendlyPath = (
    html5FriendlyPath: ?string
): SetHtml5FriendlyPathAction => ({
  type: HTML5FRIENDLYPATH_SET,
  payload: { html5FriendlyPath },
});

export const setStreams = (streams: Array<{}>): SetStreamsAction => ({
  type: STREAMS_SET,
  payload: { streams },
});

export const setDetectedFormat = (
    detectedFileFormat: string
): SetDetectedFormatAction => ({
  type: DETECTED_FORMAT_SET,
  payload: { detectedFileFormat },
});

export const fileLoaded = ({
  fileFormat,
  filePath,
}: FileLoadPayload = {}): FileLoadedEvent => ({
  type: FILE_LOADED,
  payload: {
    fileFormat,
    filePath,
  },
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
  currentTime: 0,
  duration: 0,
  fileFormat: '',
  detectedFileFormat: '',
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
    case CURRENT_TIME_SET:
    case CUT_PROGRESS_SET:
    case DURATION_SET:
    case DETECTED_FORMAT_SET:
    case FILE_FORMAT_SET:
    case FILE_PATH_SET:
    case FRAME_PATH_SET:
    case ROTATION_PREVIEW_SET:
    case USERHTML5IFIED_SET:
    case HTML5FRIENDLYPATH_SET:
    case STREAMS_SET:
      return { ...state, ...action.payload };

    case ROTATION_INC:
      return { ...state, rotation: (state.rotation + 90) % 450 };

    case FILE_LOADED:
      return action.payload
      ? {
        ...state,
        filePath: action.payload.filePath,
        fileFormat: action.payload.fileFormat,
      }
      : state;

    default:
      return state;
  }
};

export default withReset(STATE_RESET, localState);
