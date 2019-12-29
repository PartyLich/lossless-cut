import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { parseDuration, formatDuration } from '../util';
import './CutTimeInput.scss';


const baseClassName = 'CutTimeInput';

const CutTimeInput = ({
  type,
  startTimeOffset,
  setCutTime,
  getApparentCutTime,
}) => {
  const [timeState, setTimeState] = useState({
    timeString: formatDuration(getApparentCutTime() + startTimeOffset),
    isManual: false,
  });
  const [caret, setCaret] = useState(0);
  const className = `${ baseClassName } ${ baseClassName }--${ type }`;
  let input = React.createRef();

  useEffect(() => {
    input.setSelectionRange(caret, caret);
  });

  const addChar = (oldText, newText, i) => {
    const diff = newText.length - oldText.length;
    return oldText.slice(0, i - diff) +
      newText.charAt(i - 1) +
      oldText.slice(i);
  };

  const delChar = (oldText, newText, i) => {
    const diff = oldText.length - newText.length;
    let fill = '0'.repeat(diff - 1 || 1);
    if ([2, 5].includes(i)) fill = ':';
    if (i === 8) fill = '.';

    return oldText.slice(0, i) +
      fill +
      oldText.slice(i + 1);
  };

  const handleCutTimeInput = (text) => {
    const dotPositions = [2, 5, 8];
    let { timeString, isManual } = timeState;
    let newTimeString = text;
    let i = input.selectionStart;

    if (text.length > timeString.length) {
      newTimeString = addChar(timeString, text, i);
      if (dotPositions.includes(i)) i += 1;
      setCaret(i);
    }
    if (text.length < timeString.length) {
      newTimeString = delChar(timeString, text, i);
      setCaret(i);
    }

    const time = parseDuration(newTimeString);
    if (time !== undefined) {
      timeString = formatDuration(time + startTimeOffset);
      isManual = false;
      setCutTime(type, time - startTimeOffset);
    } else {
      timeString = text;
      isManual = true;
    }

    return setTimeState({
      timeString,
      isManual,
    });
  };

  const cutTime = getApparentCutTime();
  const setRef = (node) => {
    input = node;
  };

  return (
    <input
      className={className}
      style={{
        color: timeState.isManual ? '#dc1d1d' : undefined,
      }}
      type="text"
      ref={setRef}
      onChange={(e) => handleCutTimeInput(e.target.value)}
      value={timeState.isManual
        ? timeState.timeString
        : formatDuration(cutTime + startTimeOffset)
      }
    />
  );
};


CutTimeInput.propTypes = {
  type: PropTypes.string.isRequired,
  startTimeOffset: PropTypes.number.isRequired,
  setCutTime: PropTypes.func.isRequired,
  getApparentCutTime: PropTypes.func.isRequired,
};

export default CutTimeInput;
