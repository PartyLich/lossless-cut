import React from 'react';
import PropTypes from 'prop-types';

import useStore from '../configureStore';


export const StoreContext = React.createContext();
export const DispatchContext = React.createContext();

const Provider = ({ initialState, children }) => {
  const store = useStore(initialState);

  return (
    <StoreContext.Provider value={store.state}>
      <DispatchContext.Provider value={store.dispatch}>
        {children}
      </DispatchContext.Provider>
    </StoreContext.Provider>
  );
};

Provider.propTypes = {
  initialState: PropTypes.object,
  children: PropTypes.element,
};

Provider.defaultProps = {
  initialState: {},
  children: null,
};

export default Provider;
