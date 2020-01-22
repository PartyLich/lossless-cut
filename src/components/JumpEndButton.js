// @flow
import React from 'react';
import PropTypes from 'prop-types';

import { IconButton } from '.';


const START: 'start' = 'start';
const END: 'end' = 'end';
const iconMap = {
  [START]: 'backward',
  [END]: 'forward',
};
type Direction = typeof START | typeof END;
    
const JumpEndButton = (end: Direction) => ({
  clickHandler,
}: { clickHandler: () => mixed }) => {
  const symbol = iconMap[end];
  if (!symbol) throw new Error(`Invalid type "${ end }"`);

  return (
    <IconButton
      icon={`fa-step-${ symbol  }`}
      clickHandler={clickHandler}
      title={`Jump to ${ end } of video`}
    />
  );
};

const Button = ({end, clickHandler}: {
  end: Direction, 
  clickHandler: () => mixed,
}) => JumpEndButton(end)({clickHandler});
Button.Start = JumpEndButton(START);
Button.End = JumpEndButton(END);

Button.propTypes = {
  clickHandler: PropTypes.func.isRequired,
  end: PropTypes.oneOf([START, END]).isRequired,
};

export default Button;
