import React from 'react';
import PropTypes from 'prop-types';

import './Player.scss';

const FRAME_IMG_STYLE = {
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  position: 'absolute',
  background: 'black',
};

const FrameImg = ({ framePath }) => (
  <>
    <img
      style={FRAME_IMG_STYLE}
      src={framePath}
      alt=""
    />
  </>
);

FrameImg.propTypes = {
  framePath: PropTypes.string.isRequired,
};

/* eslint-disable jsx-a11y/media-has-caption */
const Player = ({
  src,
  onRateChange,
  onPlay,
  onPause,
  onDurationChange,
  onTimeUpdate,
  frameRender,
  framePath,
}) => (
  <div id="player">
    <video
      {...{
        src,
        onRateChange,
        onPlay,
        onPause,
        onDurationChange,
        onTimeUpdate,
      }}
    />

    {frameRender && (
      <FrameImg
        framePath={framePath}
      />
    )}
  </div>
);

Player.propTypes = {
  src: PropTypes.string.isRequired,
  onRateChange: PropTypes.func.isRequired,
  onPlay: PropTypes.func.isRequired,
  onPause: PropTypes.func.isRequired,
  onDurationChange: PropTypes.func.isRequired,
  onTimeUpdate: PropTypes.func.isRequired,
  frameRender: PropTypes.bool,
  framePath: PropTypes.string,
};

Player.defaultProps = {
  frameRender: false,
  framePath: undefined,
};

export default Player;
