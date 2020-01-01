import uuid from 'uuid';
import { generateColor } from './util';


export default function createSegment({ start, end } = {}) {
  return {
    start,
    end,
    color: generateColor(),
    uuid: uuid.v4(),
  };
}
