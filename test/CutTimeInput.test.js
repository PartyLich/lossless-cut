import register from 'ignore-styles';
import { test } from 'tape';
import React from 'react';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import compareToSnapshot from 'snapshotter';

import { CutTimeInput } from '../src/components';
import { NOOP } from '../src/util';


configure({ adapter: new Adapter() });

const makeProps = () => ({
  type: 'start',
  startTimeOffset: 0,
  setCutTime: NOOP,
  apparentCutTime: 10,
});

test('CutTimeInput component', (t) => {
  {
    const props = makeProps();
    const wrapper = shallow(<CutTimeInput {...props} />);
    compareToSnapshot(t, wrapper, 'CutTimeInput_start');
  }
  {
    const props = {
      ...makeProps(),
      type: 'end',
    };
    const wrapper = shallow(<CutTimeInput {...props} />);
    compareToSnapshot(t, wrapper, 'CutTimeInput_end');
  }

  t.end();
});
