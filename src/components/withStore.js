import React from 'react';

import { StoreContext, DispatchContext } from './Provider';

const withStore = (WrappedComponent) => (
  <StoreContext.Consumer>
    {(store) => (
      <DispatchContext.Consumer>
        {(dispatch) => (
          <WrappedComponent store={store} dispatch={dispatch} />
        )}
      </DispatchContext.Consumer>
    )}
  </StoreContext.Consumer>
);

export default withStore;
