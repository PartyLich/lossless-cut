import React from 'react';
import PropTypes from 'prop-types';

import './ProgressIndicator.scss';


const className = 'ProgressIndicator';

const ProgressIndicator = ({ cutProgress }) => (
  <div className={className}>
    <i
      className="fa fa-cog fa-spin fa-3x fa-fw"
      style={{ verticalAlign: 'middle', width: '1em', height: '1em' }}
    />
    {cutProgress != null && (
      <span className={`${ className }__cutProgress`}>
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
