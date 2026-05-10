import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { useState } from "react";
import { createContext } from "react";
import { provider, auth } from "./firebase";
import axiosInstance from "./axiosinstance";
import { useEffect, useContext } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const login = (userdata) => {
    const actualUser = userdata?.result || userdata;
    setUser(actualUser);
    localStorage.setItem("user", JSON.stringify(actualUser));
    return actualUser;
  };
  const logout = async () => {
    setUser(null);
    localStorage.removeItem("user");
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };
  const handlegooglesignin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseuser = result.user;
      const payload = {
        email: firebaseuser.email,
        name: firebaseuser.displayName,
        image: firebaseuser.photoURL || "https://github.com/shadcn.png",
      };
      const response = await axiosInstance.post("/user/login", payload);
      return login(response.data.result);
    } catch (error) {
      console.error(error);
      return null;
    }
  };
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser?.result || parsedUser);
      } catch {
        localStorage.removeItem("user");
      }
    }

    const unsubcribe = onAuthStateChanged(auth, async (firebaseuser) => {
      if (firebaseuser) {
        try {
          const payload = {
            email: firebaseuser.email,
            name: firebaseuser.displayName,
            image: firebaseuser.photoURL || "https://github.com/shadcn.png",
          };
          const response = await axiosInstance.post("/user/login", payload);
          login(response.data.result);
        } catch (error) {
          console.error(error);
          logout();
        } finally {
          setAuthLoading(false);
        }
      } else {
        setUser(null);
        localStorage.removeItem("user");
        setAuthLoading(false);
      }
    });
    return () => unsubcribe();
  }, []);

  return (
    <UserContext.Provider
      value={{ user, authLoading, login, logout, handlegooglesignin }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
