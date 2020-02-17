// @flow
import type { TypedFSA } from './types';

const STRIP_AUDIO_TOGGLE: 'globalState/STRIP_AUDIO_TOGGLE' = 'globalState/STRIP_AUDIO_TOGGLE';
const CAPTURE_FORMAT_TOGGLE: 'globalState/CAPTURE_FORMAT_TOGGLE' = 'globalState/CAPTURE_FORMAT_TOGGLE';
const KEYFRAME_CUT_TOGGLE: 'globalState/KEYFRAME_CUT_TOGGLE' = 'globalState/KEYFRAME_CUT_TOGGLE';
const AUTO_MERGE_TOGGLE: 'globalState/AUTO_MERGE_TOGGLE' = 'globalState/AUTO_MERGE_TOGGLE';
const ALL_STREAMS_TOGGLE: 'globalState/ALL_STREAMS_TOGGLE' = 'globalState/ALL_STREAMS_TOGGLE';
const CUSTOM_DIR_SET: 'globalState/CUSTOM_DIR_SET' = 'globalState/CUSTOM_DIR_SET';

type ToggleStripAudioAction = TypedFSA<typeof STRIP_AUDIO_TOGGLE, string>;
type ToggleCaptureFormatAction = TypedFSA<typeof CAPTURE_FORMAT_TOGGLE, void>
type ToggleKeyframeCutAction = TypedFSA<typeof KEYFRAME_CUT_TOGGLE, string>;
type ToggleAutoMergeAction = TypedFSA<typeof AUTO_MERGE_TOGGLE, string>;
type ToggleAllStreamsAction = TypedFSA<typeof ALL_STREAMS_TOGGLE, string>;
type SetCustomDirAction = TypedFSA<typeof CUSTOM_DIR_SET,
    {| customOutDir: string |}>;

type Action =
    | ToggleStripAudioAction
    | ToggleCaptureFormatAction
    | ToggleKeyframeCutAction
    | ToggleAutoMergeAction
    | ToggleAllStreamsAction
    | SetCustomDirAction
    ;

/**
 * @return {object} flux standard action
 */
export const toggleCaptureFormat = (): ToggleCaptureFormatAction => ({
  type: CAPTURE_FORMAT_TOGGLE,
});

export const toggleAllStreams = (): ToggleAllStreamsAction => ({
  type: ALL_STREAMS_TOGGLE,
  payload: 'includeAllStreams',
});

export const toggleStripAudio = (): ToggleStripAudioAction => ({
  type: STRIP_AUDIO_TOGGLE,
  payload: 'stripAudio',
});

export const toggleKeyframeCut = (): ToggleKeyframeCutAction => ({
  type: KEYFRAME_CUT_TOGGLE,
  payload: 'keyframeCut',
});

export const toggleAutoMerge = (): ToggleAutoMergeAction => ({
  type: AUTO_MERGE_TOGGLE,
  payload: 'autoMerge',
});

export const setCustomDir = (dir?: string): SetCustomDirAction => ({
  type: CUSTOM_DIR_SET,
  payload: { customOutDir: dir || '' },
});

export type State = {
  +stripAudio: boolean,
  +includeAllStreams: boolean,
  +captureFormat: string,
  +customOutDir: string,
  +keyframeCut: boolean,
  +autoMerge: boolean,
}

const isPng = (state: State): boolean => state.captureFormat === 'png';

export const initialState: State = {
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
const globalState = (
    state?: State = initialState,
    action: Action
): State => {
  // Flow fails to handle destructuring the action
  switch (action.type) {
    case STRIP_AUDIO_TOGGLE:
    case KEYFRAME_CUT_TOGGLE:
    case AUTO_MERGE_TOGGLE:
    case ALL_STREAMS_TOGGLE:
      return (action.payload)
          ? { ...state, [action.payload]: !state[action.payload] }
          : state;

    case CAPTURE_FORMAT_TOGGLE:
      return { ...state, captureFormat: isPng(state) ? 'jpeg' : 'png' };

    case CUSTOM_DIR_SET:
      return { ...state, ...action.payload };

    default:
      return state;
  }
};

export default globalState;
