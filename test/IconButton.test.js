import register from 'ignore-styles';
import { test } from 'tape';
import React from 'react';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import compareToSnapshot from 'snapshotter';

import { IconButton } from '../src/components';
import { NOOP } from '../src/util';


configure({ adapter: new Adapter() });

const makeProps = () => ({
  clickHandler: NOOP,
});

test('IconButton component', (t) => {
  {
    const props = {
      ...makeProps(),
    };
    const wrapper = shallow(<IconButton {...props} />);
    compareToSnapshot(t, wrapper, 'IconButton_default_props');
  }
  {
    const props = {
      ...makeProps(),
      icon: 'foo',
    };
    const wrapper = shallow(<IconButton {...props} />);
    compareToSnapshot(t, wrapper, 'IconButton_with_props');
  }

  {
    let called = false;
    const props = {
      ...makeProps(),
      clickHandler: () => {called = true;},
    };

    const wrapper = shallow(<IconButton {...props} />);
    wrapper.find('i[role="button"]').simulate('click');
    const msg = 'should call clickHandler';
    const actual = called;
    const expected = true;
    t.equal(actual, expected, msg);
  }

  t.end();
});
