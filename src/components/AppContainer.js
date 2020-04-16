// @flow
// Temporary container while integrating redux
import { connect } from 'react-redux';

import App from './App';


const mapProps = (state) => ({
  store: state,
});

export default connect(
    mapProps,
)(App);
