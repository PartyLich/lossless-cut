import register from 'ignore-styles';
import { test } from 'tape';
import React from 'react';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import compareToSnapshot from 'snapshotter';

import { LeftMenu } from '../src/components';
import { NOOP } from '../src/util';


configure({ adapter: new Adapter() });


const makeProps = () => ({
  cutSegments: [{}],
  selectableFormats: ['foo', 'bar'],
  segBgColor: 'foo',
  selectOnChange: NOOP,
  deleteSegmentHandler: NOOP,
  addCutSegmentHandler: NOOP,
  autoMergeToggle: NOOP,
});

test('LeftMenu component', (t) => {
  {
    const props = makeProps();
    const wrapper = shallow(<LeftMenu {...props} />);
    compareToSnapshot(t, wrapper, 'LeftMenu_required_args');
  }
  {
    const props = {
      ...makeProps(),
      disabled: false,
    };
    const wrapper = shallow(<LeftMenu {...props} />);
    compareToSnapshot(t, wrapper, 'LeftMenu_delete_enabled');
  }

  t.end();
});
