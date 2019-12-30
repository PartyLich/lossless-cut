import React, { useState } from 'react';
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
    timeString: formatDuration(0),
    isManual: false,
  });
  const className = `${ baseClassName } ${ baseClassName }--${ type }`;

  const handleCutTimeInput = (text) => {
    const time = parseDuration(text);
    if (time === undefined) {
      return setTimeState({
        timeString: text,
        isManual: true,
      });
    }

    setTimeState({
      timeString: formatDuration(time + startTimeOffset),
      isManual: false,
    });
    setCutTime(type, time - startTimeOffset);
    return null; // no idea what the lint error is on about
  };

  const cutTime = getApparentCutTime();

  return (
    <input
      className={className}
      style={{
        color: timeState.isManual ? '#dc1d1d' : undefined,
      }}
      type="text"
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
