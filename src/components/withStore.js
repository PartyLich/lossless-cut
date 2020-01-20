import React from 'react';

import { StoreContext, DispatchContext } from './Provider';

const withStore = (WrappedComponent) => (props) => (
  <StoreContext.Consumer>
    {(store) => (
      <DispatchContext.Consumer>
        {(dispatch) => (
          <WrappedComponent store={store} dispatch={dispatch} {...props} />
        )}
      </DispatchContext.Consumer>
    )}
  </StoreContext.Consumer>
);

export default withStore;
