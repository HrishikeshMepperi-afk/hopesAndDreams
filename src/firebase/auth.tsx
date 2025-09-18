'use client';

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  getAuth,
  User,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously as firebaseSignInAnonymously,
} from 'firebase/auth';
import {firebaseApp} from './config';
import {useRouter} from 'next/navigation';

const auth = getAuth(firebaseApp);

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isGuest: boolean;
  setIsGuest: (isGuest: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isGuest: false,
  setIsGuest: () => {},
});

export const AuthProvider = ({children}: {children: ReactNode}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        setIsGuest(user.isAnonymous);
        setUser(user);
      } else {
        setUser(null);
        setIsGuest(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{user, loading, isGuest, setIsGuest}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const signUp = (email: string, password: string): Promise<User> => {
  return createUserWithEmailAndPassword(auth, email, password).then(
    userCredential => userCredential.user
  );
};

export const signIn = (email: string, password: string): Promise<User> => {
  return signInWithEmailAndPassword(auth, email, password).then(
    userCredential => userCredential.user
  );
};

export const signInAnonymously = (): Promise<User> => {
  return firebaseSignInAnonymously(auth).then(
    userCredential => userCredential.user
  );
};

export const signOut = (): Promise<void> => {
  return firebaseSignOut(auth);
};
