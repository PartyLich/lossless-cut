import React from 'react';
import PropTypes from 'prop-types';

import { IconButton } from '.';


const ShortStepButton = ({
  clickHandler,
  direction,
}) => (
  <IconButton
    icon={`fa-caret-${ direction }`}
    clickHandler={clickHandler}
  />
);

ShortStepButton.propTypes = {
  clickHandler: PropTypes.func.isRequired,
  direction: PropTypes.oneOf(['right', 'left']).isRequired,
};

export default ShortStepButton;
