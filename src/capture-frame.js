import { promises as fs } from 'fs';
import mime from 'mime-types';
import strongDataUri from 'strong-data-uri';
import {
  formatDuration,
  getOutPath,
  transferTimestampsWithOffset,
} from './util';


function getFrameFromVideo(video, format) {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  canvas.getContext('2d').drawImage(video, 0, 0);

  const dataUri = canvas.toDataURL(`image/${format}`);

  return strongDataUri.decode(dataUri);
}

async function captureFrame(customOutDir, filePath, video, currentTime, captureFormat) {
  const buf = getFrameFromVideo(video, captureFormat);

  const ext = mime.extension(buf.mimetype);
  const time = formatDuration(currentTime, true);

  const outPath = getOutPath(customOutDir, filePath, `${time}.${ext}`);
  await fs.writeFile(outPath, buf);
  const offset = -video.duration + currentTime;
  return transferTimestampsWithOffset(filePath, outPath, offset);
}

export default captureFrame;
