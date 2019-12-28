import React from 'react';
import PropTypes from 'prop-types';

import './Player.scss';


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
  <div className="Player">
    <video
      className="Player__video"
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
      <img
        className="Player__frameImg"
        src={framePath}
        alt=""
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
