import test from 'tape';
import { pipe } from 'lodash/fp';

import * as actions from '../src/reducers/localState';


const reducer = actions.default;

const createState = () => Object.assign({}, {
  working: false,
  filePath: '', // Setting video src="" prevents memory leak in chromium
  html5FriendlyPath: undefined,
  userHtml5ified: false,
  playing: false,
  currentTime: undefined,
  duration: 0,
  fileFormat: '',
  detectedFileFormat: undefined,
  streams: [],
  rotation: 360,
  cutProgress: undefined,
  startTimeOffset: 0,
  framePath: '',
  rotationPreviewRequested: false,
  helpVisible: false,
});

test('localState reducer', (t) => {
  {
    const msg = 'with no args, return default state';
    const expected = createState();
    const actual = reducer(undefined, {});
    t.deepEqual(actual, expected, msg);
  }

  t.end();
});

test('localState resetLocalState', (t) => {
  const action = actions.resetLocalState;

  {
    const msg = 'reset to initial state';
    const expected = createState();
    const actual = pipe(
        () => ({
          working: true,
          filePath: 'foo/bar',
          html5FriendlyPath: 'foo/bar',
          userHtml5ified: true,
          playing: true,
          currentTime: 20,
          duration: 20,
          fileFormat: 'foo',
          detectedFileFormat: 'foo',
          streams: ['foo'],
          rotation: 90,
          cutProgress: 10,
          startTimeOffset: 40,
          framePath: 'foo',
          rotationPreviewRequested: true,
        }),
        (state) => reducer(state, action()),
    )();
    t.deepEqual(actual, expected, msg);
  }

  t.end();
});

test('localState setWorking', (t) => {
  const action = actions.setWorking;

  {
    const msg = 'sets working';
    const expected = {
      ...createState(),
      working: true,
    };
    const actual = reducer(undefined, action(true));
    t.deepEqual(actual, expected, msg);
  }

  t.end();
});

test('localState setPlaying', (t) => {
  const action = actions.setPlaying;

  {
    const msg = 'sets playing';
    const expected = {
      ...createState(),
      playing: true,
    };
    const actual = reducer(undefined, action(true));
    t.deepEqual(actual, expected, msg);
  }

  t.end();
});

test('localState setFileFormat', (t) => {
  const action = actions.setFileFormat;

  {
    const msg = 'sets fileFormat';
    const expected = {
      ...createState(),
      fileFormat: 'foobar',
    };
    const actual = reducer(undefined, action('foobar'));
    t.deepEqual(actual, expected, msg);
  }

  t.end();
});

test('localState setFilePath', (t) => {
  const action = actions.setFilePath;

  {
    const msg = 'sets filePath';
    const expected = {
      ...createState(),
      filePath: 'foor/bar/baz',
    };
    const actual = reducer(undefined, action('foor/bar/baz'));
    t.deepEqual(actual, expected, msg);
  }

  t.end();
});

test('localState setDuration', (t) => {
  const action = actions.setDuration;

  {
    const msg = 'sets duration';
    const expected = {
      ...createState(),
      duration: 360,
    };
    const actual = reducer(undefined, action(360));
    t.deepEqual(actual, expected, msg);
  }
  {
    const msg = 'negatives become 0 duration';
    const expected = {
      ...createState(),
      duration: 0,
    };
    const actual = reducer(undefined, action(-60));
    t.deepEqual(actual, expected, msg);
  }

  t.end();
});

test('localState increaseRotation', (t) => {
  const action = actions.increaseRotation;

  {
    const msg = 'increase rotation 360 -> 0';
    const expected = {
      ...createState(),
      rotation: 0,
    };
    const actual = reducer(undefined, action());
    t.deepEqual(actual, expected, msg);
  }
  {
    const msg = 'increase rotation 0 -> 90';
    const expected = {
      ...createState(),
      rotation: 90,
    };
    const actual = pipe(
        createState,
        (state) => {
          state.rotation = 0;
          return state;
        },
        (state) => reducer(state, action())
    )();
    t.deepEqual(actual, expected, msg);
  }
  {
    const msg = 'increase rotation 90 -> 180';
    const expected = {
      ...createState(),
      rotation: 180,
    };
    const actual = pipe(
        createState,
        (state) => {
          state.rotation = 90;
          return state;
        },
        (state) => reducer(state, action())
    )();
    t.deepEqual(actual, expected, msg);
  }
  {
    const msg = 'increase rotation 180 -> 270';
    const expected = {
      ...createState(),
      rotation: 270,
    };
    const actual = pipe(
        createState,
        (state) => {
          state.rotation = 180;
          return state;
        },
        (state) => reducer(state, action())
    )();
    t.deepEqual(actual, expected, msg);
  }
  {
    const msg = 'increase rotation 270 -> 360';
    const expected = {
      ...createState(),
      rotation: 360,
    };
    const actual = pipe(
        createState,
        (state) => {
          state.rotation = 270;
          return state;
        },
        (state) => reducer(state, action())
    )();
    t.deepEqual(actual, expected, msg);
  }

  t.end();
});

test('localState toggleHelp', (t) => {
  const action = actions.toggleHelp;

  {
    const msg = 'toggle help to true';
    const expected = {
      ...createState(),
      helpVisible: true,
    };
    const actual = reducer(undefined, action());
    t.deepEqual(actual, expected, msg);
  }
  {
    const msg = 'toggle help to false';
    const expected = createState();
    const actual = pipe(
        () => ({
          ...createState(),
          helpVisible: true,
        }),
        (state) => reducer(state, action())
    )();
    t.deepEqual(actual, expected, msg);
  }

  t.end();
});

test('localState setFramePath', (t) => {
  const action = actions.setFramePath;

  {
    const msg = 'sets framePath';
    const expected = {
      ...createState(),
      framePath: 'foo/bar/baz',
    };
    const actual = reducer(undefined, action('foo/bar/baz'));
    t.deepEqual(actual, expected, msg);
  }

  t.end();
});

test('localState setCutProgress', (t) => {
  const action = actions.setCutProgress;

  {
    const msg = 'sets cutProgress';
    const expected = {
      ...createState(),
      cutProgress: 0.50,
    };
    const actual = reducer(undefined, action(0.5));
    t.deepEqual(actual, expected, msg);
  }

  t.end();
});
