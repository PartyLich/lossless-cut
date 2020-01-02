import test from 'tape';
import { pipe } from 'lodash/fp';

import * as actions from '../src/reducers/globalState';


const reducer = actions.default;

const createState = () => Object.assign({}, {
  stripAudio: false,
  includeAllStreams: true,
  captureFormat: 'jpeg',
  customOutDir: '',
  keyframeCut: true,
  autoMerge: false,
});

test('globalState reducer', (t) => {
  {
    const msg = 'with no args, return default state';
    const expected = createState();
    const actual = reducer();
    t.deepEqual(actual, expected, msg);
  }

  t.end();
});

test('globalState toggleCaptureFormat', (t) => {
  const action = actions.toggleCaptureFormat;

  {
    const msg = 'toggle jpeg to png';
    const expected = {
      ...createState(),
      captureFormat: 'png',
    };
    const actual = reducer(undefined, action());
    t.deepEqual(actual, expected, msg);
  }
  {
    const msg = 'toggle png to jpeg';
    const expected = {
      ...createState(),
      captureFormat: 'jpeg',
    };
    const actual = pipe(
        () => ({
          ...createState(),
          captureFormat: 'png',
        }),
        (state) => reducer(state, action()),
    )();
    t.deepEqual(actual, expected, msg);
  }

  t.end();
});

test('globalState toggleAllStreams', (t) => {
  const action = actions.toggleAllStreams;

  {
    const msg = 'toggle includeAllStreams to false';
    const expected = {
      ...createState(),
      includeAllStreams: false,
    };
    const actual = reducer(undefined, action());
    t.deepEqual(actual, expected, msg);
  }

  {
    const msg = 'toggle includeAllStreams to true';
    const expected = {
      ...createState(),
      includeAllStreams: false,
    };
    const actual = pipe(
        () => ({
          ...createState(),
          includeAllStreams: true,
        }),
        (state) => reducer(state, action()),
    )();
    t.deepEqual(actual, expected, msg);
  }

  t.end();
});

test('globalState toggleStripAudio', (t) => {
  const action = actions.toggleStripAudio;

  {
    const msg = 'toggle stripAudio to true';
    const expected = {
      ...createState(),
      stripAudio: true,
    };
    const actual = reducer(undefined, action());
    t.deepEqual(actual, expected, msg);
  }

  {
    const msg = 'toggle stripAudio to false';
    const expected = {
      ...createState(),
      stripAudio: false,
    };
    const actual = pipe(
        () => ({
          ...createState(),
          stripAudio: true,
        }),
        (state) => reducer(state, action()),
    )();
    t.deepEqual(actual, expected, msg);
  }

  t.end();
});

test('globalState toggleKeyframeCut', (t) => {
  const action = actions.toggleKeyframeCut;

  {
    const msg = 'toggle keyframeCut to false';
    const expected = {
      ...createState(),
      keyframeCut: false,
    };
    const actual = reducer(undefined, action());
    t.deepEqual(actual, expected, msg);
  }

  {
    const msg = 'toggle keyframeCut to true';
    const expected = {
      ...createState(),
      keyframeCut: true,
    };
    const actual = pipe(
        () => ({
          ...createState(),
          keyframeCut: false,
        }),
        (state) => reducer(state, action()),
    )();
    t.deepEqual(actual, expected, msg);
  }

  t.end();
});

test('globalState toggleAutoMerge', (t) => {
  const action = actions.toggleAutoMerge;

  {
    const msg = 'toggle autoMerge to true';
    const expected = {
      ...createState(),
      autoMerge: true,
    };
    const actual = reducer(undefined, action());
    t.deepEqual(actual, expected, msg);
  }

  {
    const msg = 'toggle autoMerge to false';
    const expected = {
      ...createState(),
      autoMerge: false,
    };
    const actual = pipe(
        () => ({
          ...createState(),
          autoMerge: true,
        }),
        (state) => reducer(state, action()),
    )();
    t.deepEqual(actual, expected, msg);
  }

  t.end();
});

test('globalState setCustomDir', (t) => {
  const action = actions.setCustomDir;

  {
    const msg = 'set customOutDir';
    const expected = {
      ...createState(),
      customOutDir: 'foo/bar/baz',
    };
    const actual = reducer(undefined, action('foo/bar/baz'));
    t.deepEqual(actual, expected, msg);
  }

  {
    const msg = 'set customOutDir';
    const expected = {
      ...createState(),
    };
    const actual = pipe(
        () => ({
          ...createState(),
          customOutDir: 'foo/bar/baz',
        }),
        (state) => reducer(state, action()),
    )();
    t.deepEqual(actual, expected, msg);
  }

  t.end();
});
