import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';

import { parseDuration, formatDuration } from '../util';
import './CutTimeInput.scss';


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

const changeChar = (diff) => (oldText, newText, i) => {
  if (diff > 0) return addChar(oldText, newText, i);
  if (diff < 0) return delChar(oldText, newText, i);
  return newText;
};

const baseClassName = 'CutTimeInput';

const CutTimeInput = ({
  type,
  apparentCutTime,
  cutText,
  startTimeOffset,
  setCutTime,
  setCutText,
}) => {
  const formattedDuration = formatDuration(apparentCutTime + startTimeOffset);
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
    const timeString = cutText || formattedDuration;
    let newTimeString = text;
    let i = inputEl.current.selectionStart;

    const diff = text.length - timeString.length;
    newTimeString = changeChar(diff)(timeString, text, i);
    if (diff > 0 && dotPositions.includes(i)) i += 1;
    setCaret(i);

    const time = parseDuration(newTimeString);
    if (time === undefined) {
      setCutText(type)(text);
      return;
    }

    setCutTime(type, time - startTimeOffset);
    setCutText(type)('');
  });

  return (
    <input
      className={className}
      style={{
        color: cutText ? '#dc1d1d' : undefined,
      }}
      type="text"
      ref={inputEl}
      onChange={(e) => handleCutTimeInput(e.target.value)}
      value={cutText || formattedDuration}
    />
  );
};


CutTimeInput.propTypes = {
  type: PropTypes.string.isRequired,
  apparentCutTime: PropTypes.number.isRequired,
  cutText: PropTypes.string,
  startTimeOffset: PropTypes.number.isRequired,
  setCutTime: PropTypes.func.isRequired,
  setCutText: PropTypes.func.isRequired,
};

CutTimeInput.defaultProps = {
  cutText: '',
};

export default CutTimeInput;
