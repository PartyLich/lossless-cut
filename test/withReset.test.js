import test from 'tape';

import withReset from '../src/reducers/withReset';


test('withReset ', (t) => {
  const INITIAL = {
    foo: 'foo',
    zing: [1, 2, 3],
  };
  const RESET = 'RESET';
  const reducer = (state = INITIAL, action = {}) => {
    switch (action.type) {
      case 'SET':
        return action.payload;
      default:
        return state;
    }
  };

  {
    const testReducer = withReset(RESET, reducer);
    const state = 'bar';
    const msg = 'resets to initial state';
    const expected = INITIAL;
    const actual = testReducer(state, { type: RESET });
    t.deepEqual(actual, expected, msg);
  }

  t.end();
});
