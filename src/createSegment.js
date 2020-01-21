// @flow
import uuid from 'uuid';
import { generateColor } from './util';


export type Segment = {
    start: ?number,
    end: ?number,
    // need to type library
    color: Object,
    uuid: string,
}

export default function createSegment({ start, end }: {
  start: ?number,
  end: ?number,
} = {}): Segment {
  return {
    start,
    end,
    color: generateColor(),
    uuid: uuid.v4(),
  };
}
