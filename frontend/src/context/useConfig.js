import { useContext } from 'react';
import { ConfigContext } from './configRef';

export function useConfig() {
  return useContext(ConfigContext);
}