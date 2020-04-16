// @flow
import os from 'os';
import path from 'path';
import execa from 'execa';
import bluebird from 'bluebird';
import fileType from 'file-type';
import readChunk from 'read-chunk';
import flatMap from 'lodash/flatMap';
import sum from 'lodash/sum';
import sortBy from 'lodash/sortBy';
import readline from 'readline';
import stringToStream from 'string-to-stream';
import trash from 'trash';
import isDev from 'electron-is-dev';
import {
  formatDuration,
  getOutPath,
  transferTimestamps,
  parseTimeSpan,
} from './util';

type Format = {| ext: string, format: string |}

function getPath(type: string) {
  const platform = os.platform();

  const map = {
    darwin: `darwin/x64/${ type }`,
    win32: `win32/x64/${ type }.exe`,
    linux: `linux/x64/${ type }`,
  };

  const subPath = map[platform];

  if (!subPath) throw new Error(`Unsupported platform ${ platform }`);

  const localPath = `node_modules/${ type }-static/bin/${ subPath }`;
  return isDev
    ? localPath
    : path.join(window.process.resourcesPath, localPath);
}

async function runFfprobe(args: Array<string>) {
  const ffprobePath = await getPath('ffprobe');
  return execa(ffprobePath, args);
}

async function runFfmpeg(args: Array<string>) {
  const ffmpegPath = await getPath('ffmpeg');
  return execa(ffmpegPath, args);
}


function handleProgress(process, cutDuration, onProgress) {
  const rl = readline.createInterface({ input: process.stderr });
  rl.on('line', (line) => {
    try {
      const match = line.match(/frame=\s*[^\s]+\s+fps=\s*[^\s]+\s+q=\s*[^\s]+\s+(?:size|Lsize)=\s*[^\s]+\s+time=\s*([^\s]+)\s+/); // eslint-disable-line max-len
      if (!match) return;

      const str = match[1];
      console.log(str);
      const progressTime = parseTimeSpan(str).toSeconds();
      console.log(`progressTime: ${ progressTime }`);
      onProgress(progressTime / cutDuration);
    } catch (err) {
      console.log('Failed to parse ffmpeg progress line', err);
    }
  });
}

async function cut({
  filePath, format, cutFrom, cutTo, cutToApparent, videoDuration, rotation,
  includeAllStreams, onProgress, stripAudio, keyframeCut, outPath,
}) {
  console.log('Cutting from', cutFrom, 'to', cutToApparent);

  const cutDuration = cutToApparent - cutFrom;

  // https://github.com/mifi/lossless-cut/issues/50
  const cutFromArgs = cutFrom === 0 ? [] : ['-ss', cutFrom];
  const cutToArgs = cutTo === undefined || cutTo === videoDuration ? [] : ['-t', cutDuration];

  const inputCutArgs = keyframeCut
      ? [
        ...cutFromArgs,
        '-i',
        filePath,
        ...cutToArgs,
        '-avoid_negative_ts',
        'make_zero',
      ]
      : [
        '-i',
        filePath,
        ...cutFromArgs,
        ...cutToArgs,
      ];

  const rotationArgs = rotation !== undefined
      ? ['-metadata:s:v:0', `rotate=${ rotation }`]
      : [];

  const ffmpegArgs = [
    ...inputCutArgs,

    ...(stripAudio ? ['-an'] : ['-acodec', 'copy']),

    '-vcodec', 'copy',
    '-scodec', 'copy',

    ...(includeAllStreams ? ['-map', '0'] : []),
    '-map_metadata', '0',

    // See https://github.com/mifi/lossless-cut/issues/170
    '-ignore_unknown',

    ...rotationArgs,

    '-f', format, '-y', outPath,
  ];

  console.log('ffmpeg', ffmpegArgs.join(' '));

  onProgress(0);

  const ffmpegPath = await getPath('ffmpeg');
  const process = execa(ffmpegPath, ffmpegArgs);
  handleProgress(process, cutDuration, onProgress);
  const result = await process;
  console.log(result.stdout);

  await transferTimestamps(filePath, outPath);
}

async function cutMultiple({
  customOutDir, filePath, format, segments: segmentsUnsorted,
  videoDuration, rotation,
  includeAllStreams, onProgress, stripAudio, keyframeCut,
}: {
  customOutDir: string,
  filePath: string,
  format: string,
  segments: Array<{
    cutFrom: number,
    cutTo: number,
    cutToApparent: number,
  }>,
  videoDuration: number,
  rotation: number,
  includeAllStreams: boolean,
  onProgress: (number) => any,
  stripAudio: boolean,
  keyframeCut: boolean,
}) {
  const segments = sortBy(segmentsUnsorted, 'cutFrom');
  const singleProgresses = {};
  function onSingleProgress(id, singleProgress) {
    singleProgresses[id] = singleProgress;
    return onProgress((sum(Object.values(singleProgresses)) / segments.length));
  }

  const outFiles = [];

  const promises = [];
  let i = 0;
  const segmentProgress = (progress) => onSingleProgress(i, progress);
  // eslint-disable-next-line no-restricted-syntax
  for (const { cutFrom, cutTo, cutToApparent } of segments) {
    const ext = path.extname(filePath) || `.${ format }`;
    const cutSpecification = `${ formatDuration(cutFrom, true) }-${ formatDuration(cutToApparent, true) }`;

    const outPath = getOutPath(customOutDir, filePath, `${ cutSpecification }${ ext }`);

    promises.push(
        cut({
          outPath,
          customOutDir,
          filePath,
          format,
          videoDuration,
          rotation,
          includeAllStreams,
          stripAudio,
          keyframeCut,
          cutFrom,
          cutTo,
          cutToApparent,
          onProgress: segmentProgress,
        })
    );

    outFiles.push(outPath);
    i += 1;
  }
  await Promise.all(promises);

  return outFiles;
}

async function html5ify(filePath: string, outPath: string, encodeVideo: boolean) {
  console.log('Making HTML5 friendly version', { filePath, outPath, encodeVideo });

  const videoArgs = encodeVideo
    ? ['-vf', 'scale=-2:400,format=yuv420p', '-sws_flags', 'neighbor', '-vcodec', 'libx264', '-profile:v', 'baseline', '-x264opts', 'level=3.0', '-preset:v', 'ultrafast', '-crf', '28']
    : ['-vcodec', 'copy'];

  const ffmpegArgs = [
    '-i', filePath, ...videoArgs, '-an',
    '-y', outPath,
  ];

  console.log('ffmpeg', ffmpegArgs.join(' '));

  const { stdout } = await runFfmpeg(ffmpegArgs);
  console.log(stdout);

  await transferTimestamps(filePath, outPath);
}

async function getDuration(filePath: string) {
  // https://superuser.com/questions/650291/how-to-get-video-duration-in-seconds
  const { stdout } = await runFfprobe(['-i', filePath, '-show_entries', 'format=duration', '-print_format', 'json']);
  return parseFloat(JSON.parse(stdout).format.duration);
}

// This is just used to load something into the player with correct length,
// so user can seek and then we render frames using ffmpeg
async function html5ifyDummy(filePath: string, outPath: string) {
  console.log('Making HTML5 friendly dummy', { filePath, outPath });

  const duration = await getDuration(filePath);

  const ffmpegArgs: Array<string> = [
    // This is just a fast way of generating an empty dummy file
    // TODO use existing audio track file if it has one
    '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
    '-t', duration.toString(),
    '-acodec', 'flac',
    '-y', outPath,
  ];

  console.log('ffmpeg', ffmpegArgs.join(' '));

  const { stdout } = await runFfmpeg(ffmpegArgs);
  console.log(stdout);

  await transferTimestamps(filePath, outPath);
}

async function mergeFiles(paths: Array<string>, outPath: string) {
  console.log('Merging files', { paths }, 'to', outPath);

  // https://blog.yo1.dog/fix-for-ffmpeg-protocol-not-on-whitelist-error-for-urls/
  const ffmpegArgs = [
    '-f', 'concat', '-safe', '0', '-protocol_whitelist', 'file,pipe', '-i', '-',
    '-c', 'copy',
    '-map_metadata', '0',
    '-y', outPath,
  ];

  console.log('ffmpeg', ffmpegArgs.join(' '));

  // https://superuser.com/questions/787064/filename-quoting-in-ffmpeg-concat
  const concatTxt = paths.map((file) => `file '${ path.join(file).replace(/'/g, '\'\\\'\'') }'`).join('\n');

  console.log(concatTxt);

  const ffmpegPath = await getPath('ffmpeg');
  const process = execa(ffmpegPath, ffmpegArgs);

  stringToStream(concatTxt).pipe(process.stdin);

  const result = await process;
  console.log(result.stdout);
}

async function mergeAnyFiles({ customOutDir, paths }: {
  customOutDir: string,
  paths: Array<string>
}) {
  const firstPath = paths[0];
  const ext = path.extname(firstPath);
  const outPath = getOutPath(customOutDir, firstPath, `merged${ ext }`);
  return mergeFiles(paths, outPath);
}

async function autoMergeSegments({ customOutDir, sourceFile, segmentPaths }: {
    customOutDir: string,
    sourceFile: string,
    segmentPaths: Array<string>
}) {
  const ext = path.extname(sourceFile);
  const outPath = getOutPath(customOutDir, sourceFile, `cut-merged-${ new Date().getTime() }${ ext }`);
  await mergeFiles(segmentPaths, outPath);
  await bluebird.map(segmentPaths, trash, { concurrency: 5 });
}

// ffmpeg only supports encoding certain formats, and some of the detected input
// formats are not the same as the names used for encoding.
// Therefore we have to map between detected format and encode format
// See also ffmpeg -formats
function mapFormat(requestedFormat) {
  switch (requestedFormat) {
    // These two cmds produce identical output, so we assume that encoding
    // "ipod" means encoding m4a
    // ffmpeg -i example.aac -c copy OutputFile2.m4a
    // ffmpeg -i example.aac -c copy -f ipod OutputFile.m4a
    // See also https://github.com/mifi/lossless-cut/issues/28
    case 'm4a': return 'ipod';
    case 'aac': return 'ipod';
    default: return requestedFormat;
  }
}

function determineOutputFormat(ffprobeFormats: Array<string>, ft: Format) {
  if (ffprobeFormats.includes(ft.ext)) return ft.ext;
  return ffprobeFormats[0] || undefined;
}

async function getFormat(filePath: string) {
  console.log('getFormat', filePath);

  const { stdout } = await runFfprobe([
    '-of', 'json', '-show_format', '-i', filePath,
  ]);
  const formatsStr = JSON.parse(stdout).format.format_name;
  console.log('formats', formatsStr);
  const formats = (formatsStr || '').split(',');

  // ffprobe sometimes returns a list of formats, try to be a bit smarter about
  // it.
  const bytes = await readChunk(filePath, 0, 4100);
  const ft = fileType(bytes) || {};
  console.log(`fileType detected format ${ JSON.stringify(ft) }`);
  const assumedFormat = determineOutputFormat(formats, ft);
  return mapFormat(assumedFormat);
}

async function getAllStreams(filePath: string) {
  const { stdout } = await runFfprobe([
    '-of', 'json', '-show_entries', 'stream', '-i', filePath,
  ]);

  return JSON.parse(stdout);
}

function mapCodecToOutputFormat(codec: string, type: string): ?Format {
  const map = {
    // See mapFormat
    m4a: { ext: 'm4a', format: 'ipod' },
    aac: { ext: 'm4a', format: 'ipod' },

    mp3: { ext: 'mp3', format: 'mp3' },
    opus: { ext: 'opus', format: 'opus' },
    vorbis: { ext: 'ogg', format: 'ogg' },
    h264: { ext: 'mp4', format: 'mp4' },
    eac3: { ext: 'eac3', format: 'eac3' },

    subrip: { ext: 'srt', format: 'srt' },

    // TODO add more
    // TODO allow user to change?
  };

  if (map[codec]) return map[codec];

  const format = { format: 'matroska' };
  switch (type) {
    case 'video':
      return { ...format, ext: 'mkv' };
    case 'audio':
      return { ...format, ext: 'mka' };
    case 'subtitle':
      return { ...format, ext: 'mks' };
    default:
      return undefined;
  }
}

// https://stackoverflow.com/questions/32922226/extract-every-audio-and-subtitles-from-a-video-with-ffmpeg
async function extractAllStreams({ customOutDir, filePath }: {
  customOutDir: string,
  filePath: string,
}) {
  const { streams } = await getAllStreams(filePath);
  console.log('streams', streams);

  const outStreams = streams.map((s, i) => ({
    i,
    codec: s.codec_name,
    type: s.codec_type,
    format: mapCodecToOutputFormat(s.codec_name, s.codec_type),
  }))
      .filter((it) => it && it.format);

  // console.log(outStreams);

  const streamArgs = flatMap(outStreams, ({
    i, codec, type, format: { format, ext },
  }) => [
    '-map', `0:${ i }`, '-c', 'copy', '-f', format, '-y', getOutPath(customOutDir, filePath, `${ i }-${ type }-${ codec }.${ ext }`),
  ]);

  const ffmpegArgs = [
    '-i', filePath,
    ...streamArgs,
  ];

  console.log(ffmpegArgs);

  // TODO progress
  const { stdout } = await runFfmpeg(ffmpegArgs);
  console.log(stdout);
}

async function renderFrame(
    timestamp: number,
    filePath: string,
    rotation: number
) {
  /* eslint-disable no-useless-computed-key */
  const transpose = {
    [90]: 'transpose=2',
    [180]: 'transpose=1,transpose=1',
    [270]: 'transpose=1',
  };
  /* eslint-enable no-useless-computed-key */
  const args = [
    '-ss', timestamp,
    ...(rotation !== undefined ? ['-noautorotate'] : []),
    '-i', filePath,
    // ...(rotation !== undefined ? ['-metadata:s:v:0', 'rotate=0'] : []), // Reset the rotation metadata first
    ...(rotation !== undefined && rotation > 0 ? ['-vf', `${ transpose[rotation] }`] : []),
    '-f', 'image2',
    '-vframes', '1',
    '-q:v', '10',
    '-',
    // '-y', outPath,
  ];

  // console.time('ffmpeg');
  const ffmpegPath = await getPath('ffmpeg');
  // console.timeEnd('ffmpeg');
  console.log('ffmpeg', args);
  const { stdout } = await execa(ffmpegPath, args, { encoding: null });

  const blob = new Blob([stdout], { type: 'image/jpeg' });
  const url = URL.createObjectURL(blob);
  return url;
}


export {
  cutMultiple,
  getFormat,
  html5ify,
  html5ifyDummy,
  mergeAnyFiles,
  autoMergeSegments,
  extractAllStreams,
  renderFrame,
  getAllStreams,
};
