// @flow
import path from 'path';
import { promises as fs } from 'fs';
import padStart from 'lodash/padStart';
import swal from 'sweetalert2';
import randomColor from './randomColor';

function formatDuration(
    seconds: number = 0,
    fileNameFriendly: boolean,
): string {
  const minutes = seconds / 60;
  const hours = minutes / 60;

  const hoursPadded = padStart(Math.floor(hours).toString(), 2, '0');
  const minutesPadded = padStart(Math.floor(minutes % 60).toString(), 2, '0');
  const secondsPadded = padStart((Math.floor(seconds) % 60).toString(), 2, '0');
  const msPadded = padStart(Math.floor((seconds - Math.floor(seconds)) * 1000).toString(), 3, '0');

  // Be nice to filenames and use .
  const delim = fileNameFriendly ? '.' : ':';
  return `${ hoursPadded }${ delim }${ minutesPadded }${ delim }${ secondsPadded }.${ msPadded }`;
}

function parseDuration(str: string): ?number {
  if (!str) return undefined;

  const match = str.trim().match(/^(\d{2}):(\d{2}):(\d{2})\.(\d{3})$/);
  if (!match) return undefined;

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const seconds = parseInt(match[3], 10);
  const ms = parseInt(match[4], 10);
  if (hours > 59 || minutes > 59 || seconds > 59) return undefined;

  return ((((hours * 60) + minutes) * 60) + seconds) + (ms / 1000);
}

function getOutPath(customOutDir: string, filePath: string, nameSuffix: string) {
  const basename = path.basename(filePath);

  return customOutDir
    ? path.join(customOutDir, `${ basename }-${ nameSuffix }`)
    : `${ filePath }-${ nameSuffix }`;
}

async function transferTimestamps(inPath: string, outPath: string) {
  try {
    const stat = await fs.stat(inPath);
    await fs.utimes(outPath, stat.atime.getTime() / 1000, stat.mtime.getTime() / 1000);
  } catch (err) {
    console.error('Failed to set output file modified time', err);
  }
}

async function transferTimestampsWithOffset(inPath: string, outPath: string, offset: number) {
  try {
    const stat = await fs.stat(inPath);
    const time = (stat.mtime.getTime() / 1000) + offset;
    await fs.utimes(outPath, time, time);
  } catch (err) {
    console.error('Failed to set output file modified time', err);
  }
}

const toast = swal.mixin({
  toast: true,
  position: 'top',
  showConfirmButton: false,
  timer: 5000,
});

const errorToast = (title: string) => toast.fire({
  type: 'error',
  title,
});

async function showFfmpegFail(err: Error) {
  console.error(err);
  return errorToast(`Failed to run ffmpeg: ${ err.stack }`);
}

function setFileNameTitle(filePath: string) {
  const appName = 'LosslessCut';
  document.title = filePath ? `${ appName } - ${ path.basename(filePath) }` : 'appName';
}

async function promptTimeOffset(inputValue: string = '') {
  const { value } = await swal.fire({
    title: 'Set custom start time offset',
    text: 'Instead of video apparently starting at 0, you can offset by a specified value (useful for viewing/cutting videos according to timecodes)',
    input: 'text',
    inputValue,
    showCancelButton: true,
    inputPlaceholder: '00:00:00.000',
  });

  if (value === undefined) return undefined;

  const duration = parseDuration(value);
  // Invalid, try again
  if (duration === undefined) return promptTimeOffset(value);

  return duration;
}

const generateColor = () => randomColor(1, 0.95);

/**
 * parse ASP.NET style time span string
 * @param  {string} str time span string
 * @return {object}
 */
const parseTimeSpan = (str: string) => {
  const match = str.match(/(\d{2}):(\d{2}):(\d{2}.*)/);
  if (!match) throw new Error(`parseTimeSpan:: failed to parse ${ str }`);

  const [, hrStr, minStr, secStr] = match;
  const hr = parseInt(hrStr, 10);
  const min = parseInt(minStr, 10);
  const sec = parseFloat(secStr);

  return {
    hr,
    min,
    sec,

    /**
     * convert to seconds
     * @return {number}
     */
    toSeconds(): number {
      return (hr * 3600) + (min * 60) + sec;
    },
  };
};

const NOOP = () => { };

export {
  formatDuration,
  parseDuration,
  getOutPath,
  transferTimestamps,
  transferTimestampsWithOffset,
  toast,
  errorToast,
  showFfmpegFail,
  setFileNameTitle,
  promptTimeOffset,
  generateColor,
  parseTimeSpan,
  NOOP,
};
