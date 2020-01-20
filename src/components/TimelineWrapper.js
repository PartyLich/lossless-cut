import React from 'react';
import PropTypes from 'prop-types';


import './TimelineWrapper.scss';

const TimelineWrapper = React.forwardRef(({
  currentTimePos,
  currentTimeDisplay,
  children,
}, ref) => (
  <div ref={ref} className="TimelineWrapper">
    <div className="current-time" style={{ left: currentTimePos }} />
    {children}
    <div className="current-time-display">{currentTimeDisplay}</div>
  </div>
));

TimelineWrapper.propTypes = {
  currentTimePos: PropTypes.string.isRequired,
  currentTimeDisplay: PropTypes.string.isRequired,
  children: PropTypes.node,
};

TimelineWrapper.defaultProps = {
  children: null,
};

export default TimelineWrapper;
