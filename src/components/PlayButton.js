// @flow
import React from 'react';
import PropTypes from 'prop-types';

import { IconButton } from '.';

type Props = {
  clickHandler: function,
  playing: boolean,
}

const PlayButton = ({
  clickHandler,
  playing,
}: Props) => (
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
