import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import {
  getMeAPI, getUserToken, setUserToken, clearUserToken,
} from '@/components/landing/data';
import type { UserRecord } from '@/components/landing/data';

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: UserRecord | null;
  status: AuthStatus;
  error: string | null;
}

type Action =
  | { type: 'INIT_START' }
  | { type: 'INIT_SUCCESS'; user: UserRecord }
  | { type: 'INIT_FAIL' }
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; user: UserRecord; token: string }
  | { type: 'LOGIN_FAIL'; error: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; user: UserRecord };

const initial: AuthState = { user: null, status: 'idle', error: null };

function reducer(state: AuthState, a: Action): AuthState {
  switch (a.type) {
    case 'INIT_START': return { ...state, status: 'loading' };
    case 'INIT_SUCCESS': return { user: a.user, status: 'authenticated', error: null };
    case 'INIT_FAIL': return { user: null, status: 'unauthenticated', error: null };
    case 'LOGIN_START': return { ...state, status: 'loading', error: null };
    case 'LOGIN_SUCCESS': return { user: a.user, status: 'authenticated', error: null };
    case 'LOGIN_FAIL': return { user: null, status: 'unauthenticated', error: a.error };
    case 'LOGOUT': return { user: null, status: 'unauthenticated', error: null };
    case 'UPDATE_USER': return { ...state, user: a.user };
  }
}

interface AuthContextValue extends AuthState {
  login: (user: UserRecord, token: string) => void;
  logout: () => void;
  updateUser: (user: UserRecord) => void;
  fail: (msg: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);

  useEffect(() => {
    const token = getUserToken();
    if (!token) { dispatch({ type: 'INIT_FAIL' }); return; }
    dispatch({ type: 'INIT_START' });
    getMeAPI()
      .then(res => {
        if (res.success && res.data) dispatch({ type: 'INIT_SUCCESS', user: res.data });
        else { clearUserToken(); dispatch({ type: 'INIT_FAIL' }); }
      })
      .catch(() => { clearUserToken(); dispatch({ type: 'INIT_FAIL' }); });
  }, []);

  const login = useCallback((user: UserRecord, token: string) => {
    setUserToken(token);
    dispatch({ type: 'LOGIN_SUCCESS', user, token });
  }, []);
  const logout = useCallback(() => { clearUserToken(); dispatch({ type: 'LOGOUT' }); }, []);
  const updateUser = useCallback((user: UserRecord) => dispatch({ type: 'UPDATE_USER', user }), []);
  const fail = useCallback((error: string) => dispatch({ type: 'LOGIN_FAIL', error }), []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateUser, fail }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
