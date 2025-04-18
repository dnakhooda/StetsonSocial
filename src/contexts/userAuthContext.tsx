"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  OAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";
import { auth } from "../../firebaseConfig";

interface UserAuthContextType {
  user: User | null;
  login: () => Promise<User>;
  logout: () => Promise<void>;
}

const login = async () => {
  const provider = new OAuthProvider("microsoft.com");

  provider.setCustomParameters({
    prompt: "consent",
    tenant: "common",
  });

  const result = await signInWithPopup(auth, provider);

  if (result.user) {
    const user = result.user;
    return user;
  } else {
    throw new Error("No user found");
  }
};

const logout = async () => {
  await signOut(auth);
};

const userAuthContext = createContext<UserAuthContextType>({
  user: null,
  login: login,
  logout: logout,
});

export const UserAuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <userAuthContext.Provider value={{ user, login, logout }}>
      {children}
    </userAuthContext.Provider>
  );
};

export const useUserAuth = () => {
  return useContext(userAuthContext);
};
