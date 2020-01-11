import register from 'ignore-styles';
import { test } from 'tape';
import React from 'react';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import compareToSnapshot from 'snapshotter';

import { ProgressIndicator } from '../src/components';


configure({ adapter: new Adapter() });

const makeProps = (cutProgress = null) => ({
  cutProgress,
});

test('ProgressIndicator component', (t) => {
  {
    const props = makeProps();
    const wrapper = shallow(<ProgressIndicator {...props} />);
    compareToSnapshot(t, wrapper, 'ProgressIndicator_no_args');
  }
  {
    const props = makeProps(0.50);
    const wrapper = shallow(<ProgressIndicator {...props} />);
    compareToSnapshot(t, wrapper, 'ProgressIndicator_cutProgress');
  }
  {
    // Truncates percentages to whole number
    const props = makeProps(0.507);
    const wrapper = shallow(<ProgressIndicator {...props} />);
    compareToSnapshot(t, wrapper, 'ProgressIndicator_cutProgress');
  }

  t.end();
});
