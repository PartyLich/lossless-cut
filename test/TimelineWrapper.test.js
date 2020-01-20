import register from 'ignore-styles';
import { test } from 'tape';
import React from 'react';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import compareToSnapshot from 'snapshotter';

import { TimelineWrapper } from '../src/components';


configure({ adapter: new Adapter() });

const MockChild = () => <span>Are you mocking me?</span>;

const makeProps = () => ({
  currentTimePos: '50%',
  currentTimeDisplay: '00:10:10.000',
});

test('TimelineWrapper component', (t) => {
  {
    const props = makeProps();
    const wrapper = shallow(<TimelineWrapper {...props} />);
    compareToSnapshot(t, wrapper, 'TimelineWrapper_default_props');
  }

  {
    const msg = 'renders children';
    const props = makeProps();
    const wrapper = shallow(
      <TimelineWrapper {...props}>
        <MockChild />
      </TimelineWrapper>
    );
    const actual = wrapper.containsMatchingElement(<MockChild />);
    t.ok(actual, msg);
  }

  t.end();
});
