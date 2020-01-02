import React from 'react';
import PropTypes from 'prop-types';


const JumpCutButton = ({
  type,
  clickHandler,
}) => {
  const symbol = (type === 'start')
    ? 'backward'
    : 'forward';

  return (
    <i
      className={`fa fa-step-${ symbol } JumpCutButton JumpCutButton--${ type }`}
      title={`Jump to cut ${ type }`}
      role="button"
      tabIndex="0"
      onClick={clickHandler}
    />
  );
};

JumpCutButton.propTypes = {
  type: PropTypes.oneOf(['start', 'end']).isRequired,
  clickHandler: PropTypes.func.isRequired,
};

export default JumpCutButton;
