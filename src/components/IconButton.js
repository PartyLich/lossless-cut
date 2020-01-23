import React from 'react';
import PropTypes from 'prop-types';


const IconButton = ({
    clickHandler,
    icon,
    ...props,
}) => {
  return (
    <i
      className={`button fa ${ icon }`}
      role="button"
      tabIndex="0"
      onClick={clickHandler}
      {...props}
    />
  );
};

IconButton.propTypes = {
  clickHandler: PropTypes.func.isRequired,
  icon: PropTypes.string,
};

IconButton.defaultProps = {
  icon: '',
};

export default IconButton;
