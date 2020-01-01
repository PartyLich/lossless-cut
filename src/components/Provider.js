import React from 'react';

import configureStore from '../configureStore';


export const StoreContext = React.createContext();
export const DispatchContext = React.createContext();

const Provider = ({ initialState, children }) => {
  const store = configureStore(initialState);

  return (
    <StoreContext.Provider value={store.state}>
      <DispatchContext.Provider value={store.dispatch}>
        {children}
      </DispatchContext.Provider>
    </StoreContext.Provider>
  );
};

export default Provider;
