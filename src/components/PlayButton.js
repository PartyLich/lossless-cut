import React from 'react';
import PropTypes from 'prop-types';

import { IconButton } from '.';


const PlayButton = ({
  clickHandler,
  playing,
}) => (
  <IconButton
    icon={playing ? 'fa-pause' : 'fa-play'}
    clickHandler={clickHandler}
  />
);

PlayButton.propTypes = {
  clickHandler: PropTypes.func.isRequired,
  playing: PropTypes.bool.isRequired,
};

export default PlayButton;
