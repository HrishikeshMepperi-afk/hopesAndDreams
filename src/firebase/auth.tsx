"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { onAuthStateChanged, getAuth, User, signOut as firebaseSignOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { firebaseApp } from "./config";
import { useRouter } from "next/navigation";

const auth = getAuth(firebaseApp);

interface AuthContextType {
    user: User | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

export const signUp = (email: string, password: string): Promise<User> => {
    return createUserWithEmailAndPassword(auth, email, password)
        .then(userCredential => userCredential.user);
};

export const signIn = (email: string, password: string): Promise<User> => {
    return signInWithEmailAndPassword(auth, email, password)
        .then(userCredential => userCredential.user);
};

export const signOut = (): Promise<void> => {
    return firebaseSignOut(auth);
};
