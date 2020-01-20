import register from 'ignore-styles';
import { test } from 'tape';
import React from 'react';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import compareToSnapshot from 'snapshotter';

import { JumpCutButton } from '../src/components';
import { NOOP } from '../src/util';


configure({ adapter: new Adapter() });

const makeProps = () => ({
  type: 'start',
  clickHandler: NOOP,
});

test('JumpCutButton component', (t) => {
  {
    const props = {
      ...makeProps(),
      type: 'start',
    };
    const wrapper = shallow(<JumpCutButton {...props} />);
    compareToSnapshot(t, wrapper, 'JumpCutButton_start');
  }
  {
    const props = {
      ...makeProps(),
      type: 'end',
    };
    const wrapper = shallow(<JumpCutButton {...props} />);
    compareToSnapshot(t, wrapper, 'JumpCutButton_end');
  }

  t.end();
});
