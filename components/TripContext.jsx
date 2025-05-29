// components/TripContext.jsx
'use client';

import { createContext, useContext } from 'react';

const TripContext = createContext(null);

export const TripProvider = ({ children, value }) => {
  return (
    <TripContext.Provider value={value}>
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => useContext(TripContext);
