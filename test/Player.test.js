import register from 'ignore-styles';
import { test } from 'tape';
import React from 'react';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import compareToSnapshot from 'snapshotter';

import { Player } from '../src/components';
import { NOOP } from '../src/util';


configure({ adapter: new Adapter() });


const makeProps = () => ({
  src: '',
  onRateChange: NOOP,
  onPlay: NOOP,
  onPause: NOOP,
  onDurationChange: NOOP,
  onTimeUpdate: NOOP,
});

test('Player component', (t) => {
  {
    const props = makeProps();
    const wrapper = shallow(<Player {...props} />);
    compareToSnapshot(t, wrapper, 'Player_required_args');
  }
  {
    const props = {
      ...makeProps(),
      frameRender: true,
      framePath: '',
    };
    const wrapper = shallow(<Player {...props} />);
    compareToSnapshot(t, wrapper, 'Player_frameRender');
  }

  t.end();
});
