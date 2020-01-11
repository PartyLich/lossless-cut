import register from 'ignore-styles';
import { test } from 'tape';
import React from 'react';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import compareToSnapshot from 'snapshotter';

import { TimelineSeg } from '../src/components';
import { NOOP } from '../src/util';


configure({ adapter: new Adapter() });

const string = () => 'fff';
const makeProps = () => ({
  apparentCutStart: 0,
  apparentCutEnd: 0,
  color: {
    alpha: () => ({
      string,
    }),
    string,
  },
  isActive: true,
  isCutRangeValid: false,
  segNum: 0,
  onSegClick: NOOP,
});

test('TimelineSeg component', (t) => {
  {
    const props = makeProps();
    const wrapper = shallow(<TimelineSeg {...props} />);
    compareToSnapshot(t, wrapper, 'TimelineSeg_required_args');
  }
  {
    const props = {
      ...makeProps(),
      cutStartTime: 0,
      cutEndTime: 0,
    };
    const wrapper = shallow(<TimelineSeg {...props} />);
    compareToSnapshot(t, wrapper, 'TimelineSeg_with_times');
  }

  t.end();
});
