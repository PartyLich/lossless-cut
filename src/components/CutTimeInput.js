import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';

import { parseDuration, formatDuration } from '../util';
import './CutTimeInput.scss';
import { DispatchContext } from './Provider';
import { setCutTime as asetCutTime } from '../reducers/cutSegments';


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

const baseClassName = 'CutTimeInput';

const CutTimeInput = ({
  type,
  startTimeOffset,
  setCutTime,
  apparentCutTime,
}) => {
  const formattedDuration = formatDuration(apparentCutTime + startTimeOffset);
  const dispatch = useContext(DispatchContext);
  const [timeState, setTimeState] = useState({
    timeString: formattedDuration,
    isManual: false,
  });
  const [caret, setCaret] = useState(0);
  const className = `${ baseClassName } ${ baseClassName }--${ type }`;
  const inputEl = useRef(null);

  useEffect(
      () => {
        inputEl.current.setSelectionRange(caret, caret);
      },
      [caret],
  );

  const handleCutTimeInput = useCallback((text) => {
    const dotPositions = [2, 5, 8];
    let { timeString, isManual } = timeState;
    let newTimeString = text;
    let i = inputEl.current.selectionStart;
    if (!isManual) timeString = formattedDuration;

    if (text.length > timeString.length) {
      newTimeString = addChar(timeString, text, i);
      if (dotPositions.includes(i)) i += 1;
    }
    if (text.length < timeString.length) {
      newTimeString = delChar(timeString, text, i);
    }
    setCaret(i);

    const time = parseDuration(newTimeString);
    if (time !== undefined) {
      timeString = formatDuration(time + startTimeOffset);
      isManual = false;
      dispatch(asetCutTime(type, time - startTimeOffset));
      setCutTime(type, time - startTimeOffset);
    } else {
      timeString = text;
      isManual = true;
    }

    return setTimeState({
      timeString,
      isManual,
    });
  });

  return (
    <input
      className={className}
      style={{
        color: timeState.isManual ? '#dc1d1d' : undefined,
      }}
      type="text"
      ref={inputEl}
      onChange={(e) => handleCutTimeInput(e.target.value)}
      value={timeState.isManual
        ? timeState.timeString
        : formattedDuration
      }
    />
  );
};


CutTimeInput.propTypes = {
  type: PropTypes.string.isRequired,
  startTimeOffset: PropTypes.number.isRequired,
  setCutTime: PropTypes.func.isRequired,
  apparentCutTime: PropTypes.number.isRequired,
};

export default CutTimeInput;
