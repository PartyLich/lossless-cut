// @flow
import React from 'react';
import PropTypes from 'prop-types';

import withBlur from '../withBlur';


const START: 'start' = 'start';
const END: 'end' = 'end';
type Direction = typeof START | typeof END;

type Props = {
  clickHandler: () => mixed,
};

const JumpCutButton = (type: Direction) => ({
  clickHandler,
}: Props) => {
  const symbol = (type === START)
    ? 'backward'
    : 'forward';

  return (
    <i
      className={`fa fa-step-${ symbol } JumpCutButton JumpCutButton--${ type }`}
      title={`Jump to cut ${ type }`}
      role="button"
      tabIndex="0"
      onClick={withBlur(clickHandler)}
    />
  );
};

const Button = ({ type, clickHandler }: {
  type: Direction,
  clickHandler: () => mixed,
}) => JumpCutButton(type)({ clickHandler });
Button.Start = JumpCutButton(START);
Button.End = JumpCutButton(END);

Button.propTypes = {
  type: PropTypes.oneOf([START, END]).isRequired,
  clickHandler: PropTypes.func.isRequired,
};

export default Button;
