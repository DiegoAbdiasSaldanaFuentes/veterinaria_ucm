import { useContext } from 'react';
import { AuthContext } from './authRef';

export function useAuth() {
  return useContext(AuthContext);
}