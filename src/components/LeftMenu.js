import React from 'react';
import PropTypes from 'prop-types';
import round from 'lodash/round';

import './LeftMenu.scss';


const LeftMenu = ({
  autoMerge,
  currentSeg,
  cutSegments,
  detectedFileFormat,
  selectableFormats,
  fileFormat,
  playbackRate,
  segBgColor,
  selectOnChange,
  deleteSegmentHandler,
  addCutSegmentHandler,
  autoMergeToggle,
}) => (
  <div className="left-menu">
    <select
      style={{ width: 60 }}
      defaultValue=""
      value={fileFormat}
      title="Format of current file"
      onChange={selectOnChange}
    >
      <option key="" value="" disabled>Out fmt</option>
      {detectedFileFormat && (
        <option key={detectedFileFormat} value={detectedFileFormat}>
          {detectedFileFormat}
        </option>
      )}
      {selectableFormats.map((f) => <option key={f} value={f}>{f}</option>)}
    </select>

    <span
      className="left-menu__infospan"
      title="Playback rate"
    >
      {round(playbackRate, 1) || 1}
    </span>

    <button
      className="left-menu__infospan"
      style={{
        background: segBgColor,
        color: 'white',
      }}
      disabled={cutSegments.length < 2}
      type="button"
      title={`Delete selected segment ${ currentSeg + 1 }`}
      onClick={deleteSegmentHandler}
    >
        d
      {currentSeg + 1}
    </button>

    <button
      type="button"
      title="Add cut segment"
      onClick={addCutSegmentHandler}
    >
        c+
    </button>

    <button
      type="button"
      title={`Auto merge segments to one file after export (and trash segments)? ${ autoMerge ? 'Auto merge enabled' : 'No merging' }`}
      onClick={autoMergeToggle}
    >
      {autoMerge ? 'am' : 'nm'}
    </button>
  </div>
);

LeftMenu.propTypes = {
  autoMerge: PropTypes.bool,
  currentSeg: PropTypes.number,
  cutSegments: PropTypes.array.isRequired,
  detectedFileFormat: PropTypes.string,
  selectableFormats: PropTypes.array.isRequired,
  fileFormat: PropTypes.string,
  playbackRate: PropTypes.number,
  segBgColor: PropTypes.string.isRequired,
  selectOnChange: PropTypes.func.isRequired,
  deleteSegmentHandler: PropTypes.func.isRequired,
  addCutSegmentHandler: PropTypes.func.isRequired,
  autoMergeToggle: PropTypes.func.isRequired,
};

LeftMenu.defaultProps = {
  autoMerge: false,
  currentSeg: 0,
  detectedFileFormat: undefined,
  fileFormat: undefined,
  playbackRate: 1,
};

export default LeftMenu;
