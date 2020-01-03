import test from 'tape';
import { pipe } from 'lodash/fp';

import * as actions from '../src/reducers/cutSegments';

const reducer = actions.default;

const createSegment = () => Object.assign({}, {
  start: undefined,
  end: undefined,
  color: true,
  uuid: true,
  // color: { valpha: 1, model: 'hsv', color: [318.9844718999244, 100, 95] },
  // uuid: 'e2ba5fb3-5b0a-47d1-822b-048eaccde4fe',
});

const createState = () => Object.assign({}, {
  currentSeg: 0,
  cutSegments: [createSegment()],
});

const addSegment = (state) => {
  const { cutSegments } = state;
  cutSegments.push(createSegment());
  return state;
};


test('cutSegments reducer', (t) => {
  {
    const msg = 'with no args, return default state';
    const expected = createState();
    const actual = pipe(
        () => reducer(),
        (state) => {
          const segment = state.cutSegments[0];
          segment.color = !!segment.color;
          segment.uuid = !!segment.uuid;
          return state;
        },
    )();
    t.deepEqual(actual, expected, msg);
  }

  t.end();
});

test('cutSegments setCurrentSeg', (t) => {
  const action = actions.setCurrentSeg;

  {
    const msg = 'sets currentSeg';
    const expected = 3;
    const actual = reducer(undefined, action(3)).currentSeg;
    t.deepEqual(actual, expected, msg);
  }

  {
    const msg = 'prevents negatives';
    const expected = 0;
    const actual = reducer(undefined, action(-3)).currentSeg;
    t.deepEqual(actual, expected, msg);
  }

  t.end();
});

test('cutSegments addCutSegment', (t) => {
  const action = actions.addCutSegment;

  {
    const msg = 'adds a cutSegment with no args';
    const expected = pipe(
        createState,
        addSegment
    )();
    const actual = pipe(
        () => reducer(undefined, action()),
        (state) => {
          const { cutSegments } = state;
          cutSegments[1].color = !!cutSegments[1].color;
          cutSegments[1].uuid = !!cutSegments[1].uuid;
          return state;
        }
    )();
    t.deepEqual(actual, expected, msg);
  }

  {
    const msg = 'adds a cutSegment with start and end';
    const expected = pipe(
        createState,
        (state) => {
          const { cutSegments } = state;
          cutSegments.push({
            ...createSegment(),
            start: 4,
            end: 60,
          });
          return state;
        }
    )();
    const actual = pipe(
        () => reducer(undefined, action(4, 60)),
        (state) => {
          const { cutSegments } = state;
          cutSegments[1].color = !!cutSegments[1].color;
          cutSegments[1].uuid = !!cutSegments[1].uuid;
          return state;
        }
    )();
    t.deepEqual(actual, expected, msg);
  }

  t.end();
});

test('cutSegments removeCutSegment', (t) => {
  const action = actions.removeCutSegment;

  {
    const msg = 'remove a cutSegment';
    const expected = pipe(
        createState,
        addSegment,
    )();
    const actual = pipe(
        createState,
        addSegment,
        addSegment,
        (state) => reducer(state, action(1)),
    )();
    t.deepEqual(actual, expected, msg);
  }
  {
    const msg = 'index above bounds';
    const expected = pipe(
        createState,
        addSegment,
        addSegment,
    )();
    const actual = pipe(
        createState,
        addSegment,
        addSegment,
        (state) => reducer(state, action(4)),
    )();
    t.deepEqual(actual, expected, msg);
  }
  {
    const msg = 'retain at least 1 element';
    const expected = createState();
    const actual = pipe(
        createState,
        (state) => reducer(state, action(0)),
    )();
    t.deepEqual(actual, expected, msg);
  }

  t.end();
});

test('cutSegments setCutTime', (t) => {
  const action = actions.setCutTime;

  {
    const msg = 'set segment start';
    const expected = pipe(
        createState,
        (state) => {
          const segment = state.cutSegments[0];
          segment.start = 49;
          return state;
        }
    )();
    const actual = pipe(
        createState,
        (state) => reducer(state, action(0, 'start', 49)),
    )();
    t.deepEqual(actual, expected, msg);
  }
  {
    const msg = 'set segment end';
    const expected = pipe(
        createState,
        (state) => {
          const segment = state.cutSegments[0];
          segment.end = 49;
          return state;
        }
    )();
    const actual = pipe(
        createState,
        (state) => reducer(state, action(0, 'end', 49)),
    )();
    t.deepEqual(actual, expected, msg);
  }
  {
    const msg = 'set segment with index';
    const expected = pipe(
        createState,
        addSegment,
        addSegment,
        (state) => {
          const segment = state.cutSegments[2];
          segment.end = 49;
          return state;
        }
    )();
    const actual = pipe(
        createState,
        addSegment,
        addSegment,
        (state) => reducer(state, action(2, 'end', 49)),
    )();
    t.deepEqual(actual, expected, msg);
  }

  t.end();
});
