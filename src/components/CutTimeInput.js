import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { parseDuration, formatDuration } from '../util';


const CutTimeInput = ({
  type,
  startTimeOffset,
  setCutTime,
  getApparentCutTime,
}) => {
  const [manualTime, setManualTime] = useState('');
  const cutTimeInputStyle = {
    width: '8em',
    textAlign: (type === 'start') ? 'right' : 'left',
  };

  const isCutTimeManualSet = () => manualTime !== '';

  const handleCutTimeInput = (text) => {
    // Allow the user to erase
    if (text.length === 0) return setManualTime('');

    const time = parseDuration(text);
    if (time === undefined) return setManualTime(text);

    setManualTime('');
    setCutTime(type, time - startTimeOffset);
    return null; // no idea what the lint error is on about
  };

  const cutTime = getApparentCutTime();

  return (
    <input
      style={{
        ...cutTimeInputStyle,
        color: isCutTimeManualSet() ? '#dc1d1d' : undefined,
      }}
      type="text"
      onChange={(e) => handleCutTimeInput(e.target.value)}
      value={isCutTimeManualSet()
        ? manualTime
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
