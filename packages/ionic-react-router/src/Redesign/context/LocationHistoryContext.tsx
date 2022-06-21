import { LocationHistory } from '@ionic/react';
import { createContext, useContext } from 'react';

export const LocationHistoryContext = createContext<LocationHistory>(
  new LocationHistory()
);

export const useLocationHistory = () => useContext(LocationHistoryContext);
