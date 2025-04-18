"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  OAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import { ref, set, get } from "firebase/database";

interface UserAuthContextType {
  user: User | null;
  isAdmin: boolean;
  login: () => Promise<User>;
  logout: () => Promise<void>;
}

const storeUserData = async (user: User) => {
  try {
    const userRef = ref(db, `users/${user.uid}`);
    const snapshot = await get(userRef);

    if (
      !snapshot.exists() ||
      snapshot.val().email !== user.email ||
      snapshot.val().displayName !== user.displayName
    ) {
      await set(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastLogin: new Date().toISOString(),
        isAdmin: snapshot.exists() ? snapshot.val().isAdmin : false,
      });
    } else {
      await set(userRef, {
        ...snapshot.val(),
        lastLogin: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Error storing user data:", error);
  }
};

const login = async () => {
  const provider = new OAuthProvider("microsoft.com");

  provider.setCustomParameters({
    prompt: "consent",
    tenant: "common",
  });

  const result = await signInWithPopup(auth, provider);

  if (result.user) {
    const user = result.user;
    await storeUserData(user);
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
  isAdmin: false,
  login: login,
  logout: logout,
});

export const UserAuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        try {
          // Store user data in the database
          await storeUserData(user);

          // Check admin status
          const userRef = ref(db, `users/${user.uid}`);
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            setIsAdmin(snapshot.val().isAdmin || false);
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <userAuthContext.Provider value={{ user, isAdmin, login, logout }}>
      {children}
    </userAuthContext.Provider>
  );
};

export const useUserAuth = () => {
  return useContext(userAuthContext);
};
