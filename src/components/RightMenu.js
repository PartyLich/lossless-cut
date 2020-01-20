import React from 'react';
import PropTypes from 'prop-types';

import withBlur from '../withBlur';

import './RightMenu.scss';


const RightMenu = ({
  keyframeCut,
  stripAudio,
  captureFormat,
  includeAllStreams,
  rotationStr,
  isRotationSet,
  outputDir,

  toggleKeyframeCut,
  toggleIncludeAllStreams,
  toggleCaptureFormat,
  toggleStripAudio,
  increaseRotation,
  setOutputDir,
  captureFrame,
}) => (
  <div className="RightMenu">
    <button
      type="button"
      title={`Cut mode ${ keyframeCut ? 'nearest keyframe cut' : 'normal cut' }`}
      onClick={withBlur(toggleKeyframeCut)}
    >
      {keyframeCut ? 'kc' : 'nc'}
    </button>

    <button
      type="button"
      title={`Set output streams. Current: ${ includeAllStreams ? 'include (and cut) all streams' : 'include only primary streams' }`}
      onClick={withBlur(toggleIncludeAllStreams)}
    >
      {includeAllStreams ? 'all' : 'ps'}
    </button>

    <button
      type="button"
      title={`Delete audio? Current: ${ stripAudio ? 'delete audio tracks' : 'keep audio tracks' }`}
      onClick={withBlur(toggleStripAudio)}
    >
      {stripAudio ? 'da' : 'ka'}
    </button>

    <button
      type="button"
      title={`Set output rotation. Current: ${ rotationStr }`}
      onClick={withBlur(increaseRotation)}
    >
      {isRotationSet ? rotationStr : '-°'}
    </button>

    <button
      type="button"
      title={`Custom output dir (cancel to restore default). Current: ${ outputDir || 'Not set (use input dir)' }`}
      onClick={withBlur(setOutputDir)}
    >
      {outputDir ? 'cd' : 'id'}
    </button>

    <i
      title="Capture frame"
      style={{ margin: '-.4em -.2em' }}
      className="button fa fa-camera"
      role="button"
      tabIndex="0"
      onClick={captureFrame}
    />

    <button
      type="button"
      title="Capture frame format"
      onClick={withBlur(toggleCaptureFormat)}
    >
      {captureFormat}
    </button>
  </div>
);

RightMenu.propTypes = {
  captureFormat: PropTypes.string,
  keyframeCut: PropTypes.bool,
  outputDir: PropTypes.string,
  rotationStr: PropTypes.string,
  includeAllStreams: PropTypes.bool,
  isRotationSet: PropTypes.bool,
  stripAudio: PropTypes.bool,
  captureFrame: PropTypes.func.isRequired,
  increaseRotation: PropTypes.func.isRequired,
  setOutputDir: PropTypes.func.isRequired,
  toggleKeyframeCut: PropTypes.func.isRequired,
  toggleCaptureFormat: PropTypes.func.isRequired,
  toggleIncludeAllStreams: PropTypes.func.isRequired,
  toggleStripAudio: PropTypes.func.isRequired,
};

RightMenu.defaultProps = {
  keyframeCut: false,
  captureFormat: '',
  includeAllStreams: true,
  isRotationSet: false,
  stripAudio: false,
  outputDir: undefined,
  rotationStr: '',
};

export default RightMenu;
