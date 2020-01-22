import path from 'path';
import { ipcRenderer, remote } from 'electron';
import Mousetrap from 'mousetrap';
import clamp from 'lodash/clamp';
import throttle from 'lodash/throttle';
import Hammer from 'react-hammerjs';
import trash from 'trash';
import PQueue from 'p-queue';

import React from 'react';
import PropTypes from 'prop-types';

import {
  cutMultiple,
  extractAllStreams,
  getFormat,
  getAllStreams,
  html5ifyDummy,
  html5ify,
  autoMergeSegments,
  mergeAnyFiles,
  renderFrame,
} from '../ffmpeg';

// local
import HelpSheet from '../HelpSheet';
import { showMergeDialog, showOpenAndMergeDialog } from '../merge/merge';
import captureFrame from '../captureFrame';
import withBlur from '../withBlur';
import {
  getOutPath, formatDuration,
  toast, errorToast, showFfmpegFail,
  setFileNameTitle,
  promptTimeOffset,
} from '../util';

import {
  CutControls,
  CutTimeInput,
  DragDropField,
  JumpCutButton,
  JumpEndButton,
  LeftMenu,
  Player,
  PlayButton,
  ProgressIndicator,
  RightMenu,
  ShortStepButton,
  TimelineSeg,
  TimelineWrapper,
} from '.';

// Stylesheets
import '../font-awesome-4.6.3/scss/font-awesome.scss';
import './App.scss';

import * as globalStateActions from '../reducers/globalState';
import * as localStateActions from '../reducers/localState';
import * as cutSegmentsActions from '../reducers/cutSegments';
import * as cutTimeActions from '../reducers/cutTimeInput';


function getVideo() {
  return document.querySelector('.Player__video');
}

function seekAbs(val) {
  if (val == null || Number.isNaN(val)) return;

  const video = getVideo();

  let outVal = Math.max(0, val);
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

function doesPlayerSupportFile(streams) {
  // TODO improve, whitelist supported codecs instead
  return !streams.find((s) => ['hevc', 'prores'].includes(s.codec_name));
  // return true;
}

const throttledRenderFrame = async (
  dispatch,
  queue,
  frameRenderEnabled = false,
  filePath = '',
  framePath = '',
  time = 0,
  rotation = 0,
) => {
  if (!queue) return;

  if (queue.size < 2) {
    queue.add(async () => {
      if (!frameRenderEnabled) return;
      if (time == null || !filePath) return;

      try {
        if (framePath) {
          URL.revokeObjectURL(framePath);
        }
        const newFramePath = await renderFrame(time, filePath, rotation);
        dispatch(localStateActions.setFramePath(newFramePath));
      } catch (err) {
        console.error(err);
      }
    });
  }

  await queue.onIdle();
};


const getInitialLocalState = () => ({
  html5FriendlyPath: undefined,
  userHtml5ified: false,
  detectedFileFormat: undefined,
  streams: [],
  startTimeOffset: 0,
  rotationPreviewRequested: false,
});


class App extends React.Component {
  constructor(props) {
    super(props);

    this.store = props.store;
    this.dispatch = props.dispatch;

    this.state = {
      ...getInitialLocalState(),
    };

    this.queue = new PQueue({ concurrency: 1 });

    this.setCurrentSeg = this.setCurrentSeg.bind(this);
    this.setCutTime = this.setCutTime.bind(this);
    this.setCutText = this.setCutText.bind(this);
    this.throttledRenderFrame = this.throttledRenderFrame.bind(this);
    this.toggleHelp = () => this.dispatch(localStateActions.toggleHelp());
    this.onDurationChange = (duration) => {
      this.dispatch(localStateActions.setDuration(duration));
    };

    const load = async (filePath, html5FriendlyPath) => {
      const { working } = this.props.store.localState;

      console.log('Load', { filePath, html5FriendlyPath });
      if (working) {
        errorToast('I\'m busy');
        return;
      }

      this.resetState();
      this.dispatch(localStateActions.setWorking(true));

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
          html5FriendlyPath,
          detectedFileFormat: fileFormat,
        });
        this.dispatch(localStateActions.fileLoaded({ fileFormat, filePath }));

        if (html5FriendlyPath) {
          this.setState({ userHtml5ified: true });
        } else if (!doesPlayerSupportFile(streams)) {
          const { customOutDir } = this.props.store.globalState;
          const html5ifiedDummyPath = getOutPath(customOutDir, filePath, 'html5ified-dummy.mkv');
          await html5ifyDummy(filePath, html5ifiedDummyPath);
          this.setState({ html5FriendlyPath: html5ifiedDummyPath });
          this.throttledRenderFrame();
        }
      } catch (err) {
        if (err.code === 1 || err.code === 'ENOENT') {
          errorToast('Unsupported file');
          return;
        }
        showFfmpegFail(err);
      } finally {
        this.dispatch(localStateActions.setWorking(false));
      }
    };

    ipcRenderer.on('file-opened', (event, filePaths) => {
      if (!filePaths || filePaths.length !== 1) return;
      load(filePaths[0]);
    });

    ipcRenderer.on('html5ify', async (event, encodeVideo) => {
      const { filePath } = this.props.store.localState;
      const { customOutDir } = this.props.store.globalState;
      if (!filePath) return;

      try {
        this.dispatch(localStateActions.setWorking(true));
        const html5ifiedPath = getOutPath(customOutDir, filePath, 'html5ified.mp4');
        await html5ify(filePath, html5ifiedPath, encodeVideo);
        this.dispatch(localStateActions.setWorking(false));
        load(filePath, html5ifiedPath);
      } catch (err) {
        errorToast('Failed to html5ify file');
        console.error('Failed to html5ify file', err);
        this.dispatch(localStateActions.setWorking(false));
      }
    });

    ipcRenderer.on('show-merge-dialog', () => showOpenAndMergeDialog({
      dialog: remote.dialog,
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
      const { filePath } = this.props.store.localState;
      const { customOutDir } = this.props.store.globalState;
      if (!filePath) return;

      try {
        this.dispatch(localStateActions.setWorking(true));
        await extractAllStreams({ customOutDir, filePath });
        this.dispatch(localStateActions.setWorking(false));
      } catch (err) {
        errorToast('Failed to extract all streams');
        console.error('Failed to extract all streams', err);
        this.dispatch(localStateActions.setWorking(false));
      }
    });

    document.ondragover = (ev) => ev.preventDefault();
    document.ondragend = document.ondragover;

    document.body.ondrop = (ev) => {
      ev.preventDefault();
      const { files } = ev.dataTransfer;
      if (files.length < 1) return;
      if (files.length === 1) load(files[0].path);
      else showMergeDialog(Array.from(files).map((f) => f.path), this.mergeFiles);
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
  }

  onPlayingChange(playing) {
    this.dispatch(localStateActions.setPlaying(playing));

    if (!playing) {
      getVideo().playbackRate = 1;
    }
  }


  onTimeUpdate = (e) => {
    const { currentTime } = e.target;
    if (this.props.store.localState.currentTime === currentTime) return;

    this.setState({ rotationPreviewRequested: false }); // Reset this
    this.dispatch(localStateActions.setCurrentTime(currentTime));
    this.throttledRenderFrame({ time: currentTime });
  }

  onCutProgress = (cutProgress) => {
    this.dispatch(localStateActions.setCutProgress(cutProgress));
  }

  setCutStart = () => {
    const { currentTime } = this.props.store.localState;
    this.setCutTime('start', currentTime);
  }

  setCutEnd = () => {
    const { currentTime } = this.props.store.localState;
    this.setCutTime('end', currentTime);
  }

  setOutputDir = async () => {
    const { filePaths } = await remote.dialog.showOpenDialog({ properties: ['openDirectory'] });
    const customOutDir = (filePaths && filePaths.length === 1)
      ? filePaths[0]
      : undefined;
    this.dispatch(globalStateActions.setCustomDir(customOutDir));
  }

  getFileUri() {
    const { html5FriendlyPath } = this.state;
    const { filePath } = this.props.store.localState;
    return (html5FriendlyPath || filePath || '').replace(/#/g, '%23');
  }

  getOutputDir() {
    const { filePath } = this.props.store.localState;
    const { customOutDir } = this.props.store.globalState;
    if (customOutDir) return customOutDir;
    if (filePath) return path.dirname(filePath);
    return '';
  }

  getRotation() {
    return this.props.store.localState.rotation;
  }

  getEffectiveRotation() {
    return this.isRotationSet() ? this.getRotation() : undefined;
  }

  getRotationStr() {
    return `${ this.getRotation() }°`;
  }

  getCutSeg(i) {
    const { currentSeg, cutSegments } = this.props.store.cutSegments;
    return cutSegments[i !== undefined ? i : currentSeg];
  }

  getCutStartTime(i) {
    return this.getCutSeg(i).start;
  }

  getCutEndTime(i) {
    return this.getCutSeg(i).end;
  }

  setCutTime(type, time) {
    const { currentSeg } = this.props.store.cutSegments;

    this.dispatch(cutSegmentsActions.setCutTime(currentSeg, type, time));
  }

  setCutText(type) {
    return (text) => {
      switch (type) {
        case 'start':
          this.dispatch(cutTimeActions.setStartText(text));
          break;

        case 'end':
          this.dispatch(cutTimeActions.setEndText(text));
          break;

        default:
          throw new Error('Invalid cut text type');
      }
    };
  }

  setCurrentSeg(i) {
    this.dispatch(cutSegmentsActions.setCurrentSeg(i));
  }

  setFileFormat(fileFormat) {
    this.dispatch(localStateActions.setFileFormat(fileFormat));
  }

  getApparentCutStartTime(i) {
    const cutStartTime = this.getCutStartTime(i);
    if (cutStartTime !== undefined) return cutStartTime;
    return 0;
  }

  getApparentCutEndTime(i) {
    const cutEndTime = this.getCutEndTime(i);
    if (cutEndTime !== undefined) return cutEndTime;

    return this.props.store.localState.duration;
  }

  getOffsetCurrentTime() {
    const { currentTime } = this.props.store.localState;
    const { startTimeOffset } = this.state;
    return currentTime + startTimeOffset;
  }

  mergeFiles = async (paths) => {
    try {
      this.dispatch(localStateActions.setWorking(true));

      const { customOutDir } = this.props.store.globalState;

      // console.log('merge', paths);
      await mergeAnyFiles({ customOutDir, paths });
    } catch (err) {
      errorToast('Failed to merge files. Make sure they are all of the exact same format and codecs');
      console.error('Failed to merge files', err);
    } finally {
      this.dispatch(localStateActions.setWorking(false));
    }
  }

  frameRenderEnabled = () => {
    const { rotationPreviewRequested, userHtml5ified, streams } = this.state;
    if (rotationPreviewRequested) return true;
    return !userHtml5ified && !doesPlayerSupportFile(streams);
  }

  /* eslint-disable react/sort-comp */
  throttledRenderFrame = async ({
    time = this.props.store.localState.currentTime,
    rotation = this.getEffectiveRotation(),
  } = {}) => {
    const { filePath, framePath } = this.props.store.localState;

    await throttledRenderFrame(
        this.dispatch,
        this.queue,
        this.frameRenderEnabled(),
        filePath,
        framePath,
        time,
        rotation,
    );
  };

  increaseRotation = () => {
    this.dispatch(localStateActions.increaseRotation());

    this.setState({ rotationPreviewRequested: true }, () => this.throttledRenderFrame());
  }

  toggleCaptureFormat = () => {
    this.dispatch(globalStateActions.toggleCaptureFormat());
  }

  toggleIncludeAllStreams = () => {
    this.dispatch(globalStateActions.toggleAllStreams());
  }

  toggleStripAudio = () => {
    this.dispatch(globalStateActions.toggleStripAudio());
  };

  toggleKeyframeCut = () => {
    this.dispatch(globalStateActions.toggleKeyframeCut());
  }

  toggleAutoMerge = () => {
    this.dispatch(globalStateActions.toggleAutoMerge());
  }

  addCutSegment = () => {
    const { duration, currentTime } = this.props.store.localState;
    const { cutSegments } = this.props.store.cutSegments;

    const cutStartTime = this.getCutStartTime();
    const cutEndTime = this.getCutEndTime();

    if (cutStartTime === undefined && cutEndTime === undefined) return;

    const suggestedEnd = currentTime + 10;

    const end = suggestedEnd <= duration
      ? suggestedEnd
      : undefined;
    this.dispatch(cutSegmentsActions.addCutSegment(currentTime, end));
    this.dispatch(cutSegmentsActions.setCurrentSeg(cutSegments.length));
  }

  removeCutSegment = () => {
    const { currentSeg, cutSegments } = this.props.store.cutSegments;

    const currentSegNew = Math.min(currentSeg, cutSegments.length - 2);
    this.dispatch(cutSegmentsActions.removeCutSegment(currentSeg));
    this.dispatch(cutSegmentsActions.setCurrentSeg(currentSegNew));
  }

  jumpCutStart = () => {
    seekAbs(this.getApparentCutStartTime());
  }

  jumpCutEnd = () => {
    seekAbs(this.getApparentCutEndTime());
  }

  /* eslint-disable react/sort-comp */
  handleTap = throttle((e) => {
    const { duration } = this.props.store.localState;
    const target = document.querySelector('.TimelineWrapper');
    const parentOffset = target.getBoundingClientRect().left +
      document.body.scrollLeft;
    const relX = e.srcEvent.pageX - parentOffset;
    setCursor((relX / target.offsetWidth) * (duration));
  }, 200);
  /* eslint-enable react/sort-comp */

  playbackRateChange = () => {
    this.state.playbackRate = getVideo().playbackRate;
  }

  playCommand = () => {
    const video = getVideo();
    if (this.props.store.localState.playing) return video.pause();

    return video.play().catch((err) => {
      console.log(err);
      if (err.name === 'NotSupportedError') {
        toast.fire({ type: 'error', title: 'This format/codec is not supported. Try to convert it to a friendly format/codec in the player from the "File" menu. Note that this will only create a temporary, low quality encoded file used for previewing your cuts, and will not affect the final cut. The final cut will still be lossless. Audio is also removed to make it faster, but only in the preview.', timer: 10000 });
      }
    });
  }

  deleteSourceClick = async () => {
    const { working } = this.props.store.localState;
    // eslint-disable-next-line no-alert
    if (working || !window.confirm('Are you sure you want to move the source file to trash?')) return;
    const { filePath } = this.props.store.localState;

    this.dispatch(localStateActions.setWorking(true));
    await trash(filePath);
    this.resetState();
  }

  cutClick = async () => {
    const {
      cutSegments,
    } = this.props.store.cutSegments;
    const {
      autoMerge,
      customOutDir,
      includeAllStreams,
      keyframeCut,
      stripAudio,
    } = this.props.store.globalState;
    const {
      duration,
      fileFormat,
      filePath,
      working,
    } = this.props.store.localState;

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
      this.dispatch(localStateActions.setWorking(true));

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
        errorToast(`Whoops! ffmpeg was unable to cut this video. Try each the following things before attempting to cut again:\n1. Select a different output format from the ${ fileFormat } button (matroska takes almost everything).\n2. toggle the button "all" to "ps"`);
        return;
      }

      showFfmpegFail(err);
    } finally {
      this.dispatch(localStateActions.setWorking(false));
    }
  }

  capture = async () => {
    const {
      customOutDir: outputDir,
    } = this.state;
    const {
      captureFormat,
    } = this.props.store.globalState;
    const { filePath, currentTime } = this.props.store.localState;
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
    if (!this.props.store.playing) {
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
    this.dispatch(localStateActions.resetLocalState());
    this.dispatch(cutSegmentsActions.resetCutSegmentState());
    this.dispatch(cutTimeActions.resetState());
    setFileNameTitle();
  }

  isRotationSet() {
    // 360 means we don't modify rotation
    return this.props.store.localState.rotation !== 360;
  }

  isCutRangeValid(i) {
    return this.getApparentCutStartTime(i) < this.getApparentCutEndTime(i);
  }


  render() {
    const {
      detectedFileFormat,
      playbackRate,
    } = this.state;
    const { cutSegments } = this.props.store.cutSegments;
    const {
      autoMerge,
      includeAllStreams,
      keyframeCut,
      stripAudio,
      currentSeg,
      captureFormat,
    } = this.props.store.globalState;
    const {
      currentTime,
      cutProgress,
      duration: durationRaw,
      fileFormat,
      filePath,
      framePath,
      helpVisible,
      playing,
      working,
    } = this.props.store.localState;

    const selectableFormats = ['mov', 'mp4', 'matroska'].filter((f) => f !== detectedFileFormat);

    const duration = durationRaw || 1;
    const currentTimePos = `${ (currentTime / duration) * 100 }%`;

    const segColor = this.getCutSeg().color;
    const segBgColor = segColor.alpha(0.5).string();

    return (
      <div>
        {!filePath && (
          <DragDropField />
        )}
        {working && (
          <ProgressIndicator cutProgress={cutProgress} />
        )}

        {this.state.rotationPreviewRequested && (
          <div className="RotationPreview">
            Lossless rotation preview
          </div>
        )}

        {/* eslint-disable jsx-a11y/media-has-caption */}
        <Player
          src={this.getFileUri()}
          onRateChange={this.playbackRateChange}
          onPlay={() => this.onPlayingChange(true)}
          onPause={() => this.onPlayingChange(false)}
          onDurationChange={(e) => this.onDurationChange(e.target.duration)}
          onTimeUpdate={this.onTimeUpdate}
          frameRender={!!framePath && this.frameRenderEnabled()}
          framePath={framePath}
        />
        {/* eslint-enable jsx-a11y/media-has-caption */}

        <div className="controls-wrapper">
          <Hammer
            onTap={this.handleTap}
            onPan={this.handleTap}
            options={{ recognizers: {} }}
          >
            <TimelineWrapper
              currentTimePos={currentTimePos}
              currentTimeDisplay={formatDuration(this.getOffsetCurrentTime())}
            >
              {cutSegments.map((seg, i) => (
                <TimelineSeg
                  key={seg.uuid}
                  segNum={i}
                  color={seg.color}
                  onSegClick={this.setCurrentSeg}
                  isActive={i === currentSeg}
                  isCutRangeValid={this.isCutRangeValid(i)}
                  duration={duration}
                  cutStartTime={this.getCutStartTime(i)}
                  cutEndTime={this.getCutEndTime(i)}
                  apparentCutStart={this.getApparentCutStartTime(i)}
                  apparentCutEnd={this.getApparentCutEndTime(i)}
                />
              ))}
            </TimelineWrapper>
          </Hammer>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <JumpEndButton
              end="start"
              clickHandler={() => seekAbs(0)}
            />

            <div style={{ position: 'relative' }}>
              <CutTimeInput
                type="start"
                startTimeOffset={this.state.startTimeOffset}
                setCutTime={this.setCutTime}
                setCutText={this.setCutText}
                cutText={this.props.store.cutTime.startText}
                apparentCutTime={this.getApparentCutStartTime()}
              />
              <JumpCutButton
                type="start"
                clickHandler={this.jumpCutStart}
              />
            </div>

            <ShortStepButton
              direction="left"
              clickHandler={() => shortStep(-1)}
            />
            <PlayButton
              playing={playing}
              clickHandler={this.playCommand}
            />
            <ShortStepButton
              direction="right"
              clickHandler={() => shortStep(1)}
            />

            <div style={{ position: 'relative' }}>
              <CutTimeInput
                type="end"
                startTimeOffset={this.state.startTimeOffset}
                cutText={this.props.store.cutTime.endText}
                setCutTime={this.setCutTime}
                setCutText={this.setCutText}
                apparentCutTime={this.getApparentCutEndTime()}
              />
              <JumpCutButton
                type="end"
                clickHandler={this.jumpCutEnd}
              />
            </div>

            <JumpEndButton
              end="end"
              clickHandler={() => seekAbs(duration)}
            />
          </div>

          <CutControls
            background={segBgColor}
            cutTitle={cutSegments.length > 1 ? 'Export all segments' : 'Export selection'}
            cutClick={this.cutClick}
            setCutStart={this.setCutStart}
            setCutEnd={this.setCutEnd}
            deleteSourceClick={this.deleteSourceClick}
          />
        </div>

        <LeftMenu
          autoMerge={autoMerge}
          currentSeg={currentSeg}
          cutSegments={cutSegments}
          detectedFileFormat={detectedFileFormat}
          selectableFormats={selectableFormats}
          fileFormat={fileFormat}
          playbackRate={playbackRate}
          segBgColor={segBgColor}
          selectOnChange={withBlur((e) => this.setFileFormat(e.target.value))}
          deleteSegmentHandler={withBlur(this.removeCutSegment)}
          addCutSegmentHandler={withBlur(this.addCutSegment)}
          autoMergeToggle={withBlur(this.toggleAutoMerge)}
        />

        <RightMenu
          keyframeCut={keyframeCut}
          stripAudio={stripAudio}
          captureFormat={captureFormat}
          includeAllStreams={includeAllStreams}
          rotationStr={this.isRotationSet() ? this.getRotationStr() : 'Don\'t modify'}
          isRotationSet={this.isRotationSet()}
          outputDir={this.getOutputDir()}

          toggleKeyframeCut={this.toggleKeyframeCut}
          toggleIncludeAllStreams={this.toggleIncludeAllStreams}
          toggleCaptureFormat={this.toggleCaptureFormat}
          toggleStripAudio={this.toggleStripAudio}
          increaseRotation={this.increaseRotation}
          setOutputDir={this.setOutputDir}
          captureFrame={this.capture}
        />

        <HelpSheet visible={helpVisible} />
      </div>
    );
  }
}

App.propTypes = {
  store: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default App;
