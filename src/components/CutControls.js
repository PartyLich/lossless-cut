import React from 'react';
import PropTypes from 'prop-types';


const CutControls = ({
  background,
  setCutStart,
  cutTitle,
  cutClick,
  setCutEnd,
  deleteSourceClick,
}) => (
  <div>
    <i
      style={{ background }}
      title="Set cut start to current position"
      className="button fa fa-angle-left"
      role="button"
      tabIndex="0"
      onClick={setCutStart}
    />
    <i
      title={cutTitle}
      className="button fa fa-scissors"
      role="button"
      tabIndex="0"
      onClick={cutClick}
    />
    <i
      title="Delete source file"
      className="button fa fa-trash"
      role="button"
      tabIndex="0"
      onClick={deleteSourceClick}
    />
    <i
      style={{ background }}
      title="Set cut end to current position"
      className="button fa fa-angle-right"
      role="button"
      tabIndex="0"
      onClick={setCutEnd}
    />
  </div>
);

CutControls.propTypes = {
  background: PropTypes.string.isRequired,
  cutTitle: PropTypes.string.isRequired,
  cutClick: PropTypes.func.isRequired,
  setCutStart: PropTypes.func.isRequired,
  setCutEnd: PropTypes.func.isRequired,
  deleteSourceClick: PropTypes.func.isRequired,
};

export default CutControls;
