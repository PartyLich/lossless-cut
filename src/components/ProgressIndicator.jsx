import React from 'react';
import PropTypes from 'prop-types';


const indicatorStyle = {
  color: 'white',
  background: 'rgba(0, 0, 0, 0.3)',
  borderRadius: '.5em',
  margin: '1em',
  padding: '.2em .5em',
  position: 'absolute',
  zIndex: 1,
  top: 0,
  left: 0,
};

const textStyle = {
  color: 'rgba(255, 255, 255, 0.7)',
  paddingLeft: '.4em',
};

const ProgressIndicator = ({ cutProgress }) => (
  <div style={indicatorStyle}>
    <i
      className="fa fa-cog fa-spin fa-3x fa-fw"
      style={{ verticalAlign: 'middle', width: '1em', height: '1em' }}
    />
    {cutProgress != null && (
      <span style={textStyle}>
        {`${ Math.floor(cutProgress * 100) } %`}
      </span>
    )}
  </div>
);


ProgressIndicator.propTypes = {
  cutProgress: PropTypes.number,
};

ProgressIndicator.defaultProps = {
  cutProgress: null,
};

export default ProgressIndicator;
