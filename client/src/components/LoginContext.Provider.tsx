import React, { useCallback, useEffect, useState } from "react";
import { LoginContext, LoginContextState } from "../LoginContext";
import { useNavigate } from "react-router-dom";
import { getLogin, logout } from "../backend/api";
import { LoginResource } from "../Resources";

export const LoginContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [login, setLogin] = useState<LoginResource | undefined | false>(undefined);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const loginHandler = useCallback(
    (newLogin: false | LoginResource | undefined) => {
      try {
        if (newLogin && typeof newLogin === "object") {
          setLogin(newLogin)
          setIsLoggedIn(true);
          setIsAdmin(newLogin.role === "a");
        } else {
          setLogin(false)
          setIsLoggedIn(false);
          setIsAdmin(false);
        }
      } catch (err: any) {
        setErrorMessage(err);
      }
    },
    []
  );

  const handleErrorLogout = async () => {
    try {
      if (isLoggedIn) await logout();
      setLogin(false);
      setIsLoggedIn(false);
      setIsAdmin(false);
      setErrorMessage(null);
    } catch (err: any) {
      setErrorMessage(err);
    }
  };

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      setLogin(false);
      setIsLoggedIn(false);
      setIsAdmin(false);
      setErrorMessage(null);

      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("isAdmin");

      await new Promise((resolve) => setTimeout(resolve, 0));
      navigate("/");
    } catch (err: any) {
      setErrorMessage(err);
    }
  }, [navigate]);

  useEffect(() => {
    const fetchLoginState = async () => {
      try {
        const loginData = await getLogin();
        if (loginData) {
          loginHandler(loginData);
        } else {
          loginHandler(false);
        }
      } catch (err: any) {
        loginHandler(false);
        setErrorMessage(err);
      }
    };

    fetchLoginState();

  }, []);

  const contextValue: LoginContextState = {
    login,
    isLoggedIn,
    isAdmin,
    errorMessage,
    loginHandler,
    handleLogout,
    handleErrorLogout,
  };
  return <LoginContext.Provider value={contextValue}>{children}</LoginContext.Provider>;
};
