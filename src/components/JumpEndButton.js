import React from 'react';
import PropTypes from 'prop-types';

import { IconButton } from '.';


const JumpEndButton = ({
  clickHandler,
  end,
}) => (
  <IconButton
    icon={`fa-step-${ end === 'start' ? 'backward' : 'forward' }`}
    clickHandler={clickHandler}
    title={`Jump to ${ end } of video`}
  />
);

JumpEndButton.propTypes = {
  clickHandler: PropTypes.func.isRequired,
  end: PropTypes.oneOf(['start', 'end']).isRequired,
};

export default JumpEndButton;
