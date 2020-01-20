import register from 'ignore-styles';
import { test } from 'tape';
import React from 'react';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import compareToSnapshot from 'snapshotter';

import { RightMenu } from '../src/components';
import { NOOP } from '../src/util';


configure({ adapter: new Adapter() });


const makeProps = () => ({
  captureFrame: NOOP,
  increaseRotation: NOOP,
  setOutputDir: NOOP,
  toggleKeyframeCut: NOOP,
  toggleCaptureFormat: NOOP,
  toggleIncludeAllStreams: NOOP,
  toggleStripAudio: NOOP,
});

test('RightMenu component', (t) => {
  {
    const props = makeProps();
    const wrapper = shallow(<RightMenu {...props} />);
    compareToSnapshot(t, wrapper, 'RightMenu_required_args');
  }

  t.end();
});
