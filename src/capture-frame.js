// @flow
import { promises as fs } from 'fs';
import mime from 'mime-types';
import strongDataUri from 'strong-data-uri';
import {
  formatDuration,
  getOutPath,
  transferTimestampsWithOffset,
} from './util';


type DecodedDataUri = Buffer & {
  mimetype: string,
  mediatype: string,
  charset: string,
};

function getFrameFromVideo(video, format): DecodedDataUri {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  canvas.getContext('2d').drawImage(video, 0, 0);

  const dataUri = canvas.toDataURL(`image/${ format }`);

  return strongDataUri.decode(dataUri);
}

async function captureFrame(
    customOutDir: string,
    filePath: string,
    video: HTMLVideoElement,
    currentTime: number,
    captureFormat: string,
) {
  const buf: DecodedDataUri = getFrameFromVideo(video, captureFormat);

  const ext = mime.extension(buf.mimetype);
  const time = formatDuration(currentTime, true);

  const outPath = getOutPath(customOutDir, filePath, `${ time }.${ ext }`);
  await fs.writeFile(outPath, buf);
  const offset = -video.duration + currentTime;
  return transferTimestampsWithOffset(filePath, outPath, offset);
}

export default captureFrame;
