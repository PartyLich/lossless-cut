import React from 'react';
import PropTypes from 'prop-types';


const IconButton = (props) => {
  const {
    clickHandler,
    icon,
    ...rest
  } = props;

  return (
    <i
      className={`button fa ${ icon }`}
      role="button"
      tabIndex="0"
      onClick={clickHandler}
      {...rest}
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
