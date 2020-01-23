// @flow
import React from 'react';
import PropTypes from 'prop-types';

type Props = {
  clickHandler: () => any,
  icon: string,
};

const IconButton = ({
  clickHandler,
  icon = '',
  ...props
}: Props) => (
  <i
    {...props}
    className={`button fa ${ icon }`}
    role="button"
    tabIndex="0"
    onClick={clickHandler}
  />
);

IconButton.propTypes = {
  clickHandler: PropTypes.func.isRequired,
  icon: PropTypes.string,
};

IconButton.defaultProps = {
  icon: '',
};

export default IconButton;
