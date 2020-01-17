import test from 'tape';
import { pipe } from 'lodash/fp';

import * as actions from '../src/reducers/cutTimeInput';


const reducer = actions.default;

const createState = () => Object.assign({}, {
  startText: '',
  endText: '',
});

test('cutTimeInput reducer', (t) => {
  {
    const msg = 'with no args, return default state';
    const expected = createState();
    const actual = reducer();
    t.deepEqual(actual, expected, msg);
  }

  t.end();
});

test('cutTimeInput setStartText', (t) => {
  const action = actions.setStartText;

  {
    const msg = 'set start text';
    const expected = {
      ...createState(),
      startText: 'foo',
    };
    const actual = reducer(undefined, action('foo'));
    t.deepEqual(actual, expected, msg);
  }

  t.end();
});

test('cutTimeInput setEndText', (t) => {
  const action = actions.setEndText;

  {
    const msg = 'set end text';
    const expected = {
      ...createState(),
      endText: 'foo',
    };
    const actual = reducer(undefined, action('foo'));
    t.deepEqual(actual, expected, msg);
  }

  t.end();
});

test('cutTimeInput state reset', (t) => {
  const action = actions.resetState;

  {
    const msg = 'reset to initial state';
    const expected = createState();
    const actual = pipe(
        () => ({
          ...createState(),
          startText: 'bar',
          endText: 'foo',
        }),
        () => reducer(undefined, action()),
    )();
    t.deepEqual(actual, expected, msg);
  }

  t.end();
});
