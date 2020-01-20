import register from 'ignore-styles';
import { test } from 'tape';
import React from 'react';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import compareToSnapshot from 'snapshotter';

import { DragDropField } from '../src/components';


configure({ adapter: new Adapter() });


test('DragDropField component', (t) => {
  {
    const wrapper = shallow(<DragDropField />);
    compareToSnapshot(t, wrapper, 'DragDropField_no_args');
  }

  t.end();
});
