// @flow
import React from 'react';
import PropTypes from 'prop-types';
import Color from 'color';

import './TimelineSeg.scss';


type Props = {
  isCutRangeValid: boolean,
  duration: ?number,
  cutStartTime: ?number,
  cutEndTime: ?number,
  apparentCutStart: number,
  apparentCutEnd: number,
  isActive: boolean,
  segNum: number,
  onSegClick: function,
  color: typeof Color,
}

const startMarkerClass = 'cut-time-marker--start';
const endMarkerClass = 'cut-time-marker--end';

const TimelineSeg = ({
  isCutRangeValid,
  duration: durationRaw = undefined,
  cutStartTime = undefined,
  cutEndTime = undefined,
  apparentCutStart,
  apparentCutEnd,
  isActive,
  segNum,
  onSegClick,
  color,
}: Props) => {
  const markerWidth = 4;
  const duration = durationRaw || 1;
  const cutSectionWidth = `calc(${ ((apparentCutEnd - apparentCutStart) / duration) * 100 }% - ${ markerWidth * 2 }px)`;

  const startTimePos = `${ (apparentCutStart / duration) * 100 }%`;
  const endTimePos = `${ (apparentCutEnd / duration) * 100 }%`;
  const markerBorder = isActive ? `2px solid ${ color.string() }` : undefined;
  const background = Color(color.color).alpha(0.5)
      .string();

  const startMarkerStyle = {
    background,
    left: startTimePos,
    borderLeft: markerBorder,
  };
  const endMarkerStyle = {
    background,
    left: endTimePos,
    borderRight: markerBorder,
  };
  const cutSectionStyle = {
    background,
    left: startTimePos,
    width: cutSectionWidth,
  };

  const onThisSegClick = () => onSegClick(segNum);

  return (
    <>
      {cutStartTime !== undefined && (
        <div
          style={startMarkerStyle}
          className={`cut-time-marker ${ startMarkerClass }`}
          role="button"
          tabIndex="0"
          onClick={onThisSegClick}
        />
      )}
      {isCutRangeValid &&
        (cutStartTime !== undefined || cutEndTime !== undefined) && (
        <div
          className="cut-section"
          style={cutSectionStyle}
          role="button"
          tabIndex="0"
          onClick={onThisSegClick}
        />
      )}
      {cutEndTime !== undefined && (
        <div
          style={endMarkerStyle}
          className={`cut-time-marker ${ endMarkerClass }`}
          role="button"
          tabIndex="0"
          onClick={onThisSegClick}
        />
      )}
    </>
  );
};

TimelineSeg.propTypes = {
  isCutRangeValid: PropTypes.bool.isRequired,
  duration: PropTypes.number,
  cutStartTime: PropTypes.number,
  cutEndTime: PropTypes.number,
  apparentCutStart: PropTypes.number.isRequired,
  apparentCutEnd: PropTypes.number.isRequired,
  isActive: PropTypes.bool.isRequired,
  segNum: PropTypes.number.isRequired,
  onSegClick: PropTypes.func.isRequired,
  color: PropTypes.object.isRequired,
};

TimelineSeg.defaultProps = {
  duration: undefined,
  cutStartTime: undefined,
  cutEndTime: undefined,
};

export default TimelineSeg;
