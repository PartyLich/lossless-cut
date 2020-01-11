import register from 'ignore-styles';
import { test } from 'tape';
import React from 'react';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import compareToSnapshot from 'snapshotter';

import { CutControls } from '../src/components';
import { NOOP } from '../src/util';


configure({ adapter: new Adapter() });

const makeProps = () => ({
  background: 'fff',
  cutTitle: 'bar',
  cutClick: NOOP,
  setCutStart: NOOP,
  setCutEnd: NOOP,
  deleteSourceClick: NOOP,
});

test('CutControls component', (t) => {
  {
    const props = makeProps();
    const wrapper = shallow(<CutControls {...props} />);
    compareToSnapshot(t, wrapper, 'CutControls_req_args');
  }

  t.end();
});
