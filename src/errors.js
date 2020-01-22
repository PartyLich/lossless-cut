// @flow
const makeErr = (msg: string): Error => {
  const e = Error(msg);
  Error.captureStackTrace(e, makeErr);
  return e;
};

// BusyErr: () => Error('I\'m busy'),
export const BusyErr = () => makeErr('I\'m busy');
export const FailedCaptureErr = () => Error('Failed to capture frame');
export const FailedCutErr = (fileFormat: string) => Error(`Whoops! ffmpeg was unable to cut this video. Try each the following things before attempting to cut again:\n1. Select a different output format from the ${ fileFormat } button (matroska takes almost everything).\n2. toggle the button "all" to "ps"`);
export const FailedMergeErr = () => Error('Failed to merge files. Make sure they are all of the exact same format and codecs');

export const FfmpegErr = (err: Error) => {
  console.error(err);
  return Error(`Failed to run ffmpeg: ${ err.stack }`);
};

export const Html5ifyErr = () => Error('Failed to html5ify file');
export const StreamExtractErr = () => Error('Failed to extract all streams');
export const TimeValidationErr = () => Error('Start time must be before end time');
export const UnsupportedFileErr = () => Error('Unsupported file');


export default {
  Busy: BusyErr,
  FailedCapture: FailedCaptureErr,
  FailedCut: FailedCutErr,
  FailedMerge: FailedMergeErr,
  Ffmpeg: FfmpegErr,
  html5ify: Html5ifyErr,
  StreamExtract: StreamExtractErr,
  TimeValidation: TimeValidationErr,
  UnsupportedFile: UnsupportedFileErr,
};
