import path from 'path';
import { ipcRenderer, remote } from 'electron';
import Mousetrap from 'mousetrap';
import {
  round,
  clamp,
  clone,
  throttle,
} from 'lodash';
import Hammer from 'react-hammerjs';
import trash from 'trash';
import uuid from 'uuid';
import classnames from 'classnames';
import PQueue from 'p-queue';

import React from 'react';
import ReactDOM from 'react-dom';
import {
  cutMultiple,
  extractAllStreams,
  getFormat,
  getAllStreams,
  html5ifyDummy,
  html5ify,
  autoMergeSegments,
  renderFrame,
} from './ffmpeg';

// local
import HelpSheet from './HelpSheet';
import TimelineSeg from './TimelineSeg';
import { showMergeDialog, showOpenAndMergeDialog } from './merge/merge';
import captureFrame from './capture-frame';
import {
  getOutPath, parseDuration, formatDuration,
  toast, errorToast, showFfmpegFail,
  setFileNameTitle,
  promptTimeOffset, generateColor,
} from './util';

// Stylesheets
import './font-awesome-4.6.3/scss/font-awesome.scss';
import './main.css';


const { dialog } = remote;

function getVideo() {
  return document.querySelector('#player video');
}

function seekAbs(val) {
  const video = getVideo();
  if (val == null || Number.isNaN(val)) return;

  let outVal = val;
  if (outVal < 0) outVal = 0;
  if (outVal > video.duration) outVal = video.duration;

  video.currentTime = outVal;
}

function setCursor(val) {
  seekAbs(val);
}

function seekRel(val) {
  seekAbs(getVideo().currentTime + val);
}

function shortStep(dir) {
  seekRel(dir / 60);
}

function withBlur(cb) {
  return (e) => {
    e.target.blur();
    cb(e);
  };
}

function createSegment({ start, end } = {}) {
  return {
    start,
    end,
    color: generateColor(),
    uuid: uuid.v4(),
  };
}

function doesPlayerSupportFile(streams) {
  // TODO improve, whitelist supported codecs instead
  return !streams.find(s => ['hevc', 'prores'].includes(s.codec_name));
  // return true;
}

const getInitialLocalState = () => ({
  working: false,
  filePath: '', // Setting video src="" prevents memory leak in chromium
  html5FriendlyPath: undefined,
  userHtml5ified: false,
  playing: false,
  currentTime: undefined,
  duration: undefined,
  cutSegments: [createSegment()],
  currentSeg: 0,
  cutStartTimeManual: undefined,
  cutEndTimeManual: undefined,
  fileFormat: undefined,
  detectedFileFormat: undefined,
  streams: [],
  rotation: 360,
  cutProgress: undefined,
  startTimeOffset: 0,
  framePath: undefined,
  rotationPreviewRequested: false,
});

const globalState = {
  stripAudio: false,
  includeAllStreams: true,
  captureFormat: 'jpeg',
  customOutDir: undefined,
  keyframeCut: true,
  autoMerge: false,
};

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ...getInitialLocalState(),
      ...globalState,
    };

    this.queue = new PQueue({ concurrency: 1 });

    const load = async (filePath, html5FriendlyPath) => {
      const { working } = this.state;

      console.log('Load', { filePath, html5FriendlyPath });
      if (working) {
        errorToast('I\'m busy');
        return;
      }

      this.resetState();

      this.setState({ working: true });

      try {
        const fileFormat = await getFormat(filePath);
        if (!fileFormat) {
          errorToast('Unsupported file');
          return;
        }

        const { streams } = await getAllStreams(filePath);

        setFileNameTitle(filePath);
        this.setState({
          streams,
          filePath,
          html5FriendlyPath,
          fileFormat,
          detectedFileFormat: fileFormat,
        });

        if (html5FriendlyPath) {
          this.setState({ userHtml5ified: true });
        } else if (!doesPlayerSupportFile(streams)) {
          const { customOutDir } = this.state;
          const html5ifiedDummyPath = getOutPath(customOutDir, filePath, 'html5ified-dummy.mkv');
          await html5ifyDummy(filePath, html5ifiedDummyPath);
          this.setState({ html5FriendlyPath: html5ifiedDummyPath });
          this.throttledRenderFrame(0);
        }
      } catch (err) {
        if (err.code === 1 || err.code === 'ENOENT') {
          errorToast('Unsupported file');
          return;
        }
        showFfmpegFail(err);
      } finally {
        this.setState({ working: false });
      }
    };

    ipcRenderer.on('file-opened', (event, filePaths) => {
      if (!filePaths || filePaths.length !== 1) return;
      load(filePaths[0]);
    });

    ipcRenderer.on('html5ify', async (event, encodeVideo) => {
      const { filePath, customOutDir } = this.state;
      if (!filePath) return;

      try {
        this.setState({ working: true });
        const html5ifiedPath = getOutPath(customOutDir, filePath, 'html5ified.mp4');
        await html5ify(filePath, html5ifiedPath, encodeVideo);
        this.setState({ working: false });
        load(filePath, html5ifiedPath);
      } catch (err) {
        errorToast('Failed to html5ify file');
        console.error('Failed to html5ify file', err);
        this.setState({ working: false });
      }
    });

    ipcRenderer.on('show-merge-dialog', () => showOpenAndMergeDialog({
      dialog,
      defaultPath: this.getOutputDir(),
      onMergeClick: this.mergeFiles,
    }));

    ipcRenderer.on('set-start-offset', async () => {
      const { startTimeOffset: startTimeOffsetOld } = this.state;
      const startTimeOffset = await promptTimeOffset(
        startTimeOffsetOld !== undefined ? formatDuration(startTimeOffsetOld) : undefined,
      );

      if (startTimeOffset === undefined) return;

      this.setState({ startTimeOffset });
    });

    ipcRenderer.on('extract-all-streams', async () => {
      const { filePath, customOutDir } = this.state;
      if (!filePath) return;

      try {
        this.setState({ working: true });
        await extractAllStreams({ customOutDir, filePath });
        this.setState({ working: false });
      } catch (err) {
        errorToast('Failed to extract all streams');
        console.error('Failed to extract all streams', err);
        this.setState({ working: false });
      }
    });

    document.ondragover = ev => ev.preventDefault();
    document.ondragend = document.ondragover;

    document.body.ondrop = (ev) => {
      ev.preventDefault();
      const { files } = ev.dataTransfer;
      if (files.length < 1) return;
      if (files.length === 1) load(files[0].path);
      else showMergeDialog(Array.from(files).map(f => f.path), this.mergeFiles);
    };

    Mousetrap.bind('space', () => this.playCommand());
    Mousetrap.bind('k', () => this.playCommand());
    Mousetrap.bind('j', () => this.changePlaybackRate(-1));
    Mousetrap.bind('l', () => this.changePlaybackRate(1));
    Mousetrap.bind('left', () => seekRel(-1));
    Mousetrap.bind('right', () => seekRel(1));
    Mousetrap.bind('.', () => shortStep(1));
    Mousetrap.bind(',', () => shortStep(-1));
    Mousetrap.bind('c', () => this.capture());
    Mousetrap.bind('e', () => this.cutClick());
    Mousetrap.bind('i', () => this.setCutStart());
    Mousetrap.bind('o', () => this.setCutEnd());
    Mousetrap.bind('h', () => this.toggleHelp());
    Mousetrap.bind('+', () => this.addCutSegment());
    Mousetrap.bind('backspace', () => this.removeCutSegment());

    ipcRenderer.send('renderer-ready');
  }

  onPlayingChange(playing) {
    this.setState({ playing });

    if (!playing) {
      getVideo().playbackRate = 1;
    }
  }

  onDurationChange(duration) {
    this.setState({ duration });
  }

  onTimeUpdate = (e) => {
    const { currentTime } = e.target;
    if (this.state.currentTime === currentTime) return;

    this.setState({ rotationPreviewRequested: false }); // Reset this
    this.setState({ currentTime }, () => {
      this.throttledRenderFrame();
    });
  }

  onCutProgress = (cutProgress) => {
    this.setState({ cutProgress });
  }

  setCutStart = () => {
    const { currentTime } = this.state;
    this.setCutTime('start', currentTime);
  }

  setCutEnd = () => {
    const { currentTime } = this.state;
    this.setCutTime('end', currentTime);
  }

  setOutputDir = async () => {
    const { filePaths } = await dialog.showOpenDialog({ properties: ['openDirectory'] });
    this.setState({
      customOutDir: (filePaths && filePaths.length === 1) ? filePaths[0] : undefined,
    });
  }

  getFileUri() {
    const { html5FriendlyPath, filePath } = this.state;
    return (html5FriendlyPath || filePath || '').replace(/#/g, '%23');
  }

  getOutputDir() {
    const { customOutDir, filePath } = this.state;
    if (customOutDir) return customOutDir;
    if (filePath) return path.dirname(filePath);
    return undefined;
  }

  getRotation() {
    return this.state.rotation;
  }

  getEffectiveRotation() {
    return this.isRotationSet() ? this.getRotation() : undefined;
  }

  getRotationStr() {
    return `${this.getRotation()}°`;
  }

  getCutSeg(i) {
    const { currentSeg, cutSegments } = this.state;
    return cutSegments[i !== undefined ? i : currentSeg];
  }

  getCutStartTime(i) {
    return this.getCutSeg(i).start;
  }

  getCutEndTime(i) {
    return this.getCutSeg(i).end;
  }

  setCutTime(type, time) {
    const { currentSeg, cutSegments } = this.state;
    const cloned = clone(cutSegments);
    cloned[currentSeg][type] = time;
    this.setState({ cutSegments: cloned });
  }

  getApparentCutStartTime(i) {
    const cutStartTime = this.getCutStartTime(i);
    if (cutStartTime !== undefined) return cutStartTime;
    return 0;
  }

  getApparentCutEndTime(i) {
    const cutEndTime = this.getCutEndTime(i);
    if (cutEndTime !== undefined) return cutEndTime;
    if (this.state.duration !== undefined) return this.state.duration;
    return 0; // Haven't gotten duration yet
  }

  getOffsetCurrentTime() {
    return (this.state.currentTime || 0) + this.state.startTimeOffset;
  }

  mergeFiles = async (paths) => {
    try {
      this.setState({ working: true });

      const { customOutDir } = this.state;

      // console.log('merge', paths);
      await mergeAnyFiles({ customOutDir, paths });
    } catch (err) {
      errorToast('Failed to merge files. Make sure they are all of the exact same format and codecs');
      console.error('Failed to merge files', err);
    } finally {
      this.setState({ working: false });
    }
  }

  frameRenderEnabled = () => {
    const { rotationPreviewRequested, userHtml5ified, streams } = this.state;
    if (rotationPreviewRequested) return true;
    return !userHtml5ified && !doesPlayerSupportFile(streams);
  }

  /* eslint-disable react/sort-comp */
  throttledRenderFrame = async () => {
    if (this.queue.size < 2) {
      this.queue.add(async () => {
        if (!this.frameRenderEnabled()) return;

        const { filePath, currentTime } = this.state;
        const rotation = this.getEffectiveRotation();
        if (currentTime == null || !filePath) return;

        try {
          if (this.state.framePath) URL.revokeObjectURL(this.state.framePath);
          const framePath = await renderFrame(currentTime, filePath, rotation);
          this.setState({ framePath });
        } catch (err) {
          console.error(err);
        }
      });
    }

    await this.queue.onIdle();
  };

  increaseRotation = () => {
    this.setState(({ rotation }) => ({ rotation: (rotation + 90) % 450 }));
    this.setState({ rotationPreviewRequested: true }, () => this.throttledRenderFrame());
  }

  toggleCaptureFormat = () => {
    const isPng = this.state.captureFormat === 'png';
    this.setState({ captureFormat: isPng ? 'jpeg' : 'png' });
  }

  toggleIncludeAllStreams = () => {
    this.setState(({ includeAllStreams }) => ({ includeAllStreams: !includeAllStreams }));
  }

  toggleStripAudio = () => this.setState(({ stripAudio }) => ({ stripAudio: !stripAudio }));

  toggleKeyframeCut = () => this.setState(({ keyframeCut }) => ({ keyframeCut: !keyframeCut }));

  toggleAutoMerge = () => this.setState(({ autoMerge }) => ({ autoMerge: !autoMerge }));

  addCutSegment = () => {
    const { cutSegments, currentTime, duration } = this.state;

    const cutStartTime = this.getCutStartTime();
    const cutEndTime = this.getCutEndTime();

    if (cutStartTime === undefined && cutEndTime === undefined) return;

    const suggestedStart = currentTime;
    const suggestedEnd = suggestedStart + 10;

    const cutSegmentsNew = [
      ...cutSegments,
      createSegment({
        start: currentTime,
        end: suggestedEnd <= duration ? suggestedEnd : undefined,
      }),
    ];

    const currentSegNew = cutSegmentsNew.length - 1;
    this.setState({ currentSeg: currentSegNew, cutSegments: cutSegmentsNew });
  }

  removeCutSegment = () => {
    const { currentSeg, cutSegments } = this.state;

    if (cutSegments.length < 2) return;

    const cutSegmentsNew = [...cutSegments];
    cutSegmentsNew.splice(currentSeg, 1);

    const currentSegNew = Math.min(currentSeg, cutSegmentsNew.length - 1);
    this.setState({ currentSeg: currentSegNew, cutSegments: cutSegmentsNew });
  }

  jumpCutStart = () => {
    seekAbs(this.getApparentCutStartTime());
  }

  jumpCutEnd = () => {
    seekAbs(this.getApparentCutEndTime());
  }

  /* eslint-disable react/sort-comp */
  handleTap = throttle((e) => {
    const target = document.querySelector('.timeline-wrapper');
    const parentOffset = target.getBoundingClientRect().left +
      document.body.scrollLeft;
    const relX = e.srcEvent.pageX - parentOffset;
    setCursor((relX / target.offsetWidth) * (this.state.duration || 0));
  }, 200);
  /* eslint-enable react/sort-comp */

  playbackRateChange = () => {
    this.state.playbackRate = getVideo().playbackRate;
  }

  playCommand = () => {
    const video = getVideo();
    if (this.state.playing) return video.pause();

    return video.play().catch((err) => {
      console.log(err);
      if (err.name === 'NotSupportedError') {
        toast.fire({ type: 'error', title: 'This format/codec is not supported. Try to convert it to a friendly format/codec in the player from the "File" menu. Note that this will only create a temporary, low quality encoded file used for previewing your cuts, and will not affect the final cut. The final cut will still be lossless. Audio is also removed to make it faster, but only in the preview.', timer: 10000 });
      }
    });
  }

  deleteSourceClick = async () => {
    // eslint-disable-next-line no-alert
    if (this.state.working || !window.confirm('Are you sure you want to move the source file to trash?')) return;
    const { filePath } = this.state;

    this.setState({ working: true });
    await trash(filePath);
    this.resetState();
  }

  cutClick = async () => {
    const {
      filePath, customOutDir, fileFormat, duration, includeAllStreams,
      stripAudio, keyframeCut, autoMerge, working, cutSegments,
    } = this.state;

    if (working) {
      errorToast('I\'m busy');
      return;
    }

    const rotation = this.getEffectiveRotation();

    const cutStartTime = this.getCutStartTime();
    const cutEndTime = this.getCutEndTime();

    if (!(this.isCutRangeValid() || cutEndTime === undefined || cutStartTime === undefined)) {
      errorToast('Start time must be before end time');
      return;
    }

    try {
      this.setState({ working: true });

      const segments = cutSegments.map((seg, i) => ({
        cutFrom: this.getApparentCutStartTime(i),
        cutTo: this.getCutEndTime(i),
        cutToApparent: this.getApparentCutEndTime(i),
      }));

      const outFiles = await cutMultiple({
        customOutDir,
        filePath,
        format: fileFormat,
        videoDuration: duration,
        rotation,
        includeAllStreams,
        stripAudio,
        keyframeCut,
        segments,
        onProgress: this.onCutProgress,
      });

      if (outFiles.length > 1 && autoMerge) {
        this.onCutProgress(0); // TODO

        await autoMergeSegments({
          customOutDir,
          sourceFile: filePath,
          segmentPaths: outFiles,
        });
      }
    } catch (err) {
      console.error('stdout:', err.stdout);
      console.error('stderr:', err.stderr);

      if (err.code === 1 || err.code === 'ENOENT') {
        errorToast(`Whoops! ffmpeg was unable to cut this video. Try each the following things before attempting to cut again:\n1. Select a different output format from the ${fileFormat} button (matroska takes almost everything).\n2. toggle the button "all" to "ps"`);
        return;
      }

      showFfmpegFail(err);
    } finally {
      this.setState({ working: false });
    }
  }

  capture = async () => {
    const {
      filePath, customOutDir: outputDir, currentTime, captureFormat,
    } = this.state;
    if (!filePath) return;
    try {
      await captureFrame(outputDir, filePath, getVideo(), currentTime, captureFormat);
    } catch (err) {
      console.error(err);
      errorToast('Failed to capture frame');
    }
  }

  changePlaybackRate(dir) {
    const video = getVideo();
    if (!this.state.playing) {
      video.playbackRate = 0.5; // dir * 0.5;
      video.play();
    } else {
      const newRate = video.playbackRate + (dir * 0.15);
      video.playbackRate = clamp(newRate, 0.05, 16);
    }
  }

  resetState() {
    const video = getVideo();
    video.currentTime = 0;
    video.playbackRate = 1;
    this.setState(getInitialLocalState());
    setFileNameTitle();
  }

  isRotationSet() {
    // 360 means we don't modify rotation
    return this.state.rotation !== 360;
  }

  isCutRangeValid(i) {
    return this.getApparentCutStartTime(i) < this.getApparentCutEndTime(i);
  }

  toggleHelp() {
    this.setState(({ helpVisible }) => ({ helpVisible: !helpVisible }));
  }

  renderCutTimeInput(type) {
    const cutTimeManualKey = type === 'start' ? 'cutStartTimeManual' : 'cutEndTimeManual';
    const cutTimeInputStyle = { width: '8em', textAlign: type === 'start' ? 'right' : 'left' };

    const isCutTimeManualSet = () => this.state[cutTimeManualKey] !== undefined;

    const handleCutTimeInput = (text) => {
      // Allow the user to erase
      if (text.length === 0) {
        this.setState({ [cutTimeManualKey]: undefined });
        return;
      }

      const time = parseDuration(text);
      if (time === undefined) {
        this.setState({ [cutTimeManualKey]: text });
        return;
      }

      this.setState({ [cutTimeManualKey]: undefined });

      this.setCutTime(type, time - this.state.startTimeOffset);
    };

    const cutTime = type === 'start' ? this.getApparentCutStartTime() : this.getApparentCutEndTime();

    return (
      <input
        style={{ ...cutTimeInputStyle, color: isCutTimeManualSet() ? '#dc1d1d' : undefined }}
        type="text"
        onChange={e => handleCutTimeInput(e.target.value)}
        value={isCutTimeManualSet()
          ? this.state[cutTimeManualKey]
          : formatDuration(cutTime + this.state.startTimeOffset)
        }
      />
    );
  }

  render() {
    const {
      working, filePath, duration: durationRaw, cutProgress, currentTime, playing,
      fileFormat, detectedFileFormat, playbackRate, keyframeCut, includeAllStreams, stripAudio,
      captureFormat, helpVisible, currentSeg, cutSegments, autoMerge,
    } = this.state;

    const selectableFormats = ['mov', 'mp4', 'matroska'].filter(f => f !== detectedFileFormat);

    const duration = durationRaw || 1;
    const currentTimePos = currentTime !== undefined && `${(currentTime / duration) * 100}%`;

    const segColor = this.getCutSeg().color;
    const segBgColor = segColor.alpha(0.5).string();

    const jumpCutButtonStyle = {
      position: 'absolute', color: 'black', bottom: 0, top: 0, padding: '2px 8px',
    };
    const infoSpanStyle = {
      background: 'rgba(255, 255, 255, 0.4)', padding: '.1em .4em', margin: '0 3px', fontSize: 13, borderRadius: '.3em',
    };

    return (
      <div>
        {!filePath && (
          <div id="drag-drop-field">
            <div style={{ fontSize: '9vw' }}>DROP VIDEO</div>
            <div>PRESS H FOR HELP</div>
          </div>
        )}
        {working && (
        <div style={{
          color: 'white', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '.5em', margin: '1em', padding: '.2em .5em', position: 'absolute', zIndex: 1, top: 0, left: 0,
        }}
        >
          <i className="fa fa-cog fa-spin fa-3x fa-fw" style={{ verticalAlign: 'middle', width: '1em', height: '1em' }} />
          {cutProgress != null && (
            <span style={{ color: 'rgba(255, 255, 255, 0.7)', paddingLeft: '.4em' }}>
              {`${Math.floor(cutProgress * 100)} %`}
            </span>
          )}
        </div>
        )}

        {this.state.rotationPreviewRequested && (
          <div style={{
            position: 'absolute', zIndex: 1, top: '1em', right: '1em', color: 'white',
          }}
          >
            Lossless rotation preview
          </div>
        )}

        {/* eslint-disable jsx-a11y/media-has-caption */}
        <div id="player">
          <video
            src={this.getFileUri()}
            onRateChange={this.playbackRateChange}
            onPlay={() => this.onPlayingChange(true)}
            onPause={() => this.onPlayingChange(false)}
            onDurationChange={e => this.onDurationChange(e.target.duration)}
            onTimeUpdate={this.onTimeUpdate}
          />

          {this.state.framePath && this.frameRenderEnabled() && (
            <img
              style={{
                width: '100%', height: '100%', objectFit: 'contain', left: 0, right: 0, top: 0, bottom: 0, position: 'absolute', background: 'black',
              }}
              src={this.state.framePath}
              alt=""
            />
          )}
        </div>
        {/* eslint-enable jsx-a11y/media-has-caption */}

        <div className="controls-wrapper">
          <Hammer
            onTap={this.handleTap}
            onPan={this.handleTap}
            options={{ recognizers: {} }}
          >
            <div className="timeline-wrapper">
              {currentTimePos !== undefined && <div className="current-time" style={{ left: currentTimePos }} />}

              {cutSegments.map((seg, i) => (
                <TimelineSeg
                  key={seg.uuid}
                  segNum={i}
                  color={seg.color}
                  onSegClick={currentSegNew => this.setState({ currentSeg: currentSegNew })}
                  isActive={i === currentSeg}
                  isCutRangeValid={this.isCutRangeValid(i)}
                  duration={duration}
                  cutStartTime={this.getCutStartTime(i)}
                  cutEndTime={this.getCutEndTime(i)}
                  apparentCutStart={this.getApparentCutStartTime(i)}
                  apparentCutEnd={this.getApparentCutEndTime(i)}
                />
              ))}

              <div id="current-time-display">{formatDuration(this.getOffsetCurrentTime())}</div>
            </div>
          </Hammer>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <i
              className="button fa fa-step-backward"
              role="button"
              tabIndex="0"
              title="Jump to start of video"
              onClick={() => seekAbs(0)}
            />

            <div style={{ position: 'relative' }}>
              {this.renderCutTimeInput('start')}
              <i
                style={{ ...jumpCutButtonStyle, left: 0 }}
                className="fa fa-step-backward"
                title="Jump to cut start"
                role="button"
                tabIndex="0"
                onClick={withBlur(this.jumpCutStart)}
              />
            </div>

            <i
              className="button fa fa-caret-left"
              role="button"
              tabIndex="0"
              onClick={() => shortStep(-1)}
            />
            <i
              className={classnames({
                button: true, fa: true, 'fa-pause': playing, 'fa-play': !playing,
              })}
              role="button"
              tabIndex="0"
              onClick={this.playCommand}
            />
            <i
              className="button fa fa-caret-right"
              role="button"
              tabIndex="0"
              onClick={() => shortStep(1)}
            />

            <div style={{ position: 'relative' }}>
              {this.renderCutTimeInput('end')}
              <i
                style={{ ...jumpCutButtonStyle, right: 0 }}
                className="fa fa-step-forward"
                title="Jump to cut end"
                role="button"
                tabIndex="0"
                onClick={withBlur(this.jumpCutEnd)}
              />
            </div>

            <i
              className="button fa fa-step-forward"
              role="button"
              tabIndex="0"
              title="Jump to end of video"
              onClick={() => seekAbs(duration)}
            />
          </div>

          <div>
            <i
              style={{ background: segBgColor }}
              title="Set cut start to current position"
              className="button fa fa-angle-left"
              role="button"
              tabIndex="0"
              onClick={this.setCutStart}
            />
            <i
              title={cutSegments.length > 1 ? 'Export all segments' : 'Export selection'}
              className="button fa fa-scissors"
              role="button"
              tabIndex="0"
              onClick={this.cutClick}
            />
            <i
              title="Delete source file"
              className="button fa fa-trash"
              role="button"
              tabIndex="0"
              onClick={this.deleteSourceClick}
            />
            <i
              style={{ background: segBgColor }}
              title="Set cut end to current position"
              className="button fa fa-angle-right"
              role="button"
              tabIndex="0"
              onClick={this.setCutEnd}
            />
          </div>
        </div>

        <div className="left-menu">
          <select style={{ width: 60 }} defaultValue="" value={fileFormat} title="Format of current file" onChange={withBlur(e => this.setState({ fileFormat: e.target.value }))}>
            <option key="" value="" disabled>Out fmt</option>
            {detectedFileFormat && (
              <option key={detectedFileFormat} value={detectedFileFormat}>
                {detectedFileFormat}
              </option>
            )}
            {selectableFormats.map(f => <option key={f} value={f}>{f}</option>)}
          </select>

          <span style={infoSpanStyle} title="Playback rate">
            {round(playbackRate, 1) || 1}
          </span>

          <button
            style={{ ...infoSpanStyle, background: segBgColor, color: 'white' }}
            disabled={cutSegments.length < 2}
            type="button"
            title={`Delete selected segment ${currentSeg + 1}`}
            onClick={withBlur(() => this.removeCutSegment())}
          >
            d
            {currentSeg + 1}
          </button>

          <button
            type="button"
            title="Add cut segment"
            onClick={withBlur(() => this.addCutSegment())}
          >
            c+
          </button>

          <button
            type="button"
            title={`Auto merge segments to one file after export (and trash segments)? ${autoMerge ? 'Auto merge enabled' : 'No merging'}`}
            onClick={withBlur(this.toggleAutoMerge)}
          >
            {autoMerge ? 'am' : 'nm'}
          </button>
        </div>

        <div className="right-menu">
          <button
            type="button"
            title={`Cut mode ${keyframeCut ? 'nearest keyframe cut' : 'normal cut'}`}
            onClick={withBlur(this.toggleKeyframeCut)}
          >
            {keyframeCut ? 'kc' : 'nc'}
          </button>

          <button
            type="button"
            title={`Set output streams. Current: ${includeAllStreams ? 'include (and cut) all streams' : 'include only primary streams'}`}
            onClick={withBlur(this.toggleIncludeAllStreams)}
          >
            {includeAllStreams ? 'all' : 'ps'}
          </button>

          <button
            type="button"
            title={`Delete audio? Current: ${stripAudio ? 'delete audio tracks' : 'keep audio tracks'}`}
            onClick={withBlur(this.toggleStripAudio)}
          >
            {stripAudio ? 'da' : 'ka'}
          </button>

          <button
            type="button"
            title={`Set output rotation. Current: ${this.isRotationSet() ? this.getRotationStr() : 'Don\'t modify'}`}
            onClick={withBlur(this.increaseRotation)}
          >
            {this.isRotationSet() ? this.getRotationStr() : '-°'}
          </button>

          <button
            type="button"
            title={`Custom output dir (cancel to restore default). Current: ${this.getOutputDir() || 'Not set (use input dir)'}`}
            onClick={withBlur(this.setOutputDir)}
          >
            {this.getOutputDir() ? 'cd' : 'id'}
          </button>

          <i
            title="Capture frame"
            style={{ margin: '-.4em -.2em' }}
            className="button fa fa-camera"
            role="button"
            tabIndex="0"
            onClick={this.capture}
          />

          <button
            type="button"
            title="Capture frame format"
            onClick={withBlur(this.toggleCaptureFormat)}
          >
            {captureFormat}
          </button>
        </div>

        <HelpSheet visible={!!helpVisible} />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));

console.log('Version', remote.app.getVersion());